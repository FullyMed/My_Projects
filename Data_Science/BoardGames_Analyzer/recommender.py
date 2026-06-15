import re
import ast
import numpy as np
import pandas as pd
from pathlib import Path
from collections import defaultdict
import joblib


class BoardGameDiscoveryEngine:
    def __init__(self, base_path="."):
        self.base_path = Path(base_path)
        self.raw_path = self.base_path / "Dataset" / "Raw"
        self.processed_path = self.base_path / "Dataset" / "Processed"

        self.games = None
        self.df_meta_clean = None
        self.sent_summary = None
        self.sent_mean = 0.0

        self.desc_sim = None
        self.content_sim = None
        self.emb_sim = None

        self.meta_ids = None
        self.id_to_idx = {}
        self.idx_to_id = {}

        self.NAME_COL = None
        self.MECH_COL = "boardgamemechanic"
        self.THEME_COL = "boardgamecategory"
        self.FAMILY_COL = "boardgamefamily"
        self.PUB_COL = "boardgamepublisher"

        self.mech_tokens = None
        self.cat_tokens = None
        self.fam_tokens = None
        self.pub_tokens = None

        self.pop_norm = None

        self.TRAIT_EXPANSIONS = {
            "strategy": {
                "categories": ["strategy", "economic", "puzzle", "territory building", "city building"],
                "mechanics": ["hand management", "tile placement", "area majority / influence", "set collection"]
            },
            "family": {
                "categories": ["family", "children's game", "party game", "card game"],
                "mechanics": ["tile placement", "set collection", "pattern building"]
            },
            "horror": {
                "categories": ["horror"],
                "mechanics": ["cooperative game", "hidden movement"]
            },
            "mystery": {
                "categories": ["mystery", "deduction"],
                "mechanics": ["deduction", "hidden roles", "memory"]
            },
            "fun": {
                "categories": ["party game", "humor"],
                "mechanics": ["push your luck", "real-time", "voting"]
            },
            "co-op": {
                "categories": [],
                "mechanics": ["cooperative game"]
            },
            "coop": {
                "categories": [],
                "mechanics": ["cooperative game"]
            }
        }

        self._load_all()

    # -----------------------------
    # Basic helpers
    # -----------------------------
    @staticmethod
    def to_list_safe(x):
        if x is None:
            return []
        if isinstance(x, float) and pd.isna(x):
            return []
        if isinstance(x, list):
            return [str(i).strip() for i in x if str(i).strip()]
        if isinstance(x, (tuple, set)):
            return [str(i).strip() for i in x if str(i).strip()]
        if isinstance(x, str):
            s = x.strip()
            if not s or s.lower() == "nan":
                return []
            if (s.startswith("[") and s.endswith("]")) or (s.startswith("(") and s.endswith(")")):
                try:
                    parsed = ast.literal_eval(s)
                    if isinstance(parsed, (list, tuple, set)):
                        return [str(i).strip() for i in parsed if str(i).strip()]
                except Exception:
                    pass
            if "|" in s:
                return [i.strip() for i in s.split("|") if i.strip()]
            if "," in s:
                return [i.strip() for i in s.split(",") if i.strip()]
            return [s]
        return [str(x).strip()]

    @staticmethod
    def normalize_token(s):
        return str(s).strip().lower()

    def normalize_list(self, x):
        return [self.normalize_token(i) for i in self.to_list_safe(x) if self.normalize_token(i)]

    @staticmethod
    def norm_token(s: str) -> str:
        return re.sub(r"\s+", " ", str(s).strip().lower())

    def overlap_items(self, candidate_values, user_values):
        cand_raw = self.to_list_safe(candidate_values)
        user_norm = set(self.normalize_list(user_values))

        out = []
        seen = set()
        for item in cand_raw:
            norm = self.normalize_token(item)
            if norm in user_norm and norm not in seen:
                out.append(str(item).strip())
                seen.add(norm)
        return out

    def overlap_score(self, candidate_values, user_values):
        user_norm = set(self.normalize_list(user_values))
        if not user_norm:
            return 0.0
        cand_norm = set(self.normalize_list(candidate_values))
        hit = len(cand_norm.intersection(user_norm))
        return hit / len(user_norm)

    def safe_minmax(self, values, full_index):
        if isinstance(values, pd.Series):
            s = values.reindex(full_index).astype(float)
        else:
            s = pd.Series(values, index=full_index).astype(float)

        if len(s) == 0:
            return pd.Series(dtype=float)

        arr = s.values
        if np.all(np.isnan(arr)):
            return pd.Series(0.0, index=full_index)

        mn = np.nanmin(arr)
        mx = np.nanmax(arr)

        if mx == mn:
            return pd.Series(0.0, index=full_index)

        arr = np.nan_to_num(arr, nan=np.nanmean(arr))
        norm = (arr - mn) / (mx - mn + 1e-9)
        return pd.Series(norm, index=full_index)

    def coalesce_list_columns(self, df, base_name):
        candidates = [
            c for c in [
                base_name,
                f"{base_name}_x",
                f"{base_name}_y",
                f"{base_name}_title",
                f"{base_name}_trait",
            ]
            if c in df.columns
        ]

        if not candidates:
            df[base_name] = [[] for _ in range(len(df))]
            return df

        def combine_row(row):
            merged = []
            seen = set()
            for c in candidates:
                for item in self.to_list_safe(row[c]):
                    norm = self.normalize_token(item)
                    if norm and norm not in seen:
                        merged.append(str(item).strip())
                        seen.add(norm)
            return merged

        df[base_name] = df.apply(combine_row, axis=1)

        for c in candidates:
            if c != base_name and c in df.columns:
                df.drop(columns=c, inplace=True)

        return df

    # -----------------------------
    # Load data
    # -----------------------------
    def _load_all(self):
        self._load_metadata()
        self._load_similarity()
        self._load_sentiment()
        self._build_popularity()
        self._build_tokens()

    def _load_metadata(self):
        meta_path = self.raw_path / "games_detailed_info.csv"
        if not meta_path.exists():
            raise FileNotFoundError(f"Missing file: {meta_path}")

        df_meta = pd.read_csv(meta_path, low_memory=False)
        df_meta["id"] = pd.to_numeric(df_meta["id"], errors="coerce")
        df_meta = df_meta.dropna(subset=["id"]).copy()
        df_meta["id"] = df_meta["id"].astype(int)
        df_meta = df_meta.drop_duplicates(subset=["id"]).copy()

        games = df_meta.copy()

        possible_name_cols = ["name", "primary", "title", "game_name", "Name"]
        detected_name_col = None
        for c in possible_name_cols:
            if c in games.columns:
                detected_name_col = c
                break

        if detected_name_col is None:
            raise ValueError(f"Could not detect title column. Available columns: {list(games.columns)}")

        self.NAME_COL = detected_name_col
        games["name"] = games[self.NAME_COL].astype(str)

        if "averageweight" in games.columns:
            games["complexity"] = pd.to_numeric(games["averageweight"], errors="coerce")
        else:
            games["complexity"] = np.nan

        if "usersrated" in games.columns:
            games["num_votes"] = pd.to_numeric(games["usersrated"], errors="coerce")
        else:
            games["num_votes"] = np.nan

        if "bayesaverage" in games.columns:
            games["avg_rating"] = pd.to_numeric(games["bayesaverage"], errors="coerce")
        elif "average" in games.columns:
            games["avg_rating"] = pd.to_numeric(games["average"], errors="coerce")
        else:
            games["avg_rating"] = np.nan

        if "yearpublished" in games.columns:
            games["yearpublished"] = pd.to_numeric(games["yearpublished"], errors="coerce")
        else:
            games["yearpublished"] = np.nan

        for col in [self.MECH_COL, self.THEME_COL, self.FAMILY_COL, self.PUB_COL]:
            if col in games.columns:
                games[col] = games[col].apply(self.to_list_safe)

        self.games = games
        self.df_meta_clean = games.set_index("id").copy()

    def _load_similarity(self):
        desc_path = self.processed_path / "desc_topk_csr.joblib"
        content_path = self.processed_path / "content_topk_csr.joblib"
        emb_path = self.processed_path / "emb_topk_csr.joblib"

        for p in [desc_path, content_path, emb_path]:
            if not p.exists():
                raise FileNotFoundError(f"Missing file: {p}")

        self.desc_sim = joblib.load(desc_path)
        self.content_sim = joblib.load(content_path)
        self.emb_sim = joblib.load(emb_path)

        self.meta_ids = self.df_meta_clean.index.to_numpy()
        self.id_to_idx = {int(gid): i for i, gid in enumerate(self.meta_ids)}
        self.idx_to_id = {i: int(gid) for i, gid in enumerate(self.meta_ids)}

    def _load_sentiment(self):
        sent_path = self.processed_path / "sentiment_summary.csv"
        if sent_path.exists():
            sent_summary = pd.read_csv(sent_path, index_col="id")
            sent_summary.index = pd.to_numeric(sent_summary.index, errors="coerce")
            sent_summary = sent_summary[~pd.isna(sent_summary.index)].copy()
            sent_summary.index = sent_summary.index.astype(int)

            if "avg_sentiment_score" in sent_summary.columns:
                self.sent_summary = sent_summary
                self.sent_mean = float(sent_summary["avg_sentiment_score"].mean())
                self.games["sentiment_score"] = self.games["id"].map(sent_summary["avg_sentiment_score"]).fillna(self.sent_mean)
                return

        self.sent_summary = None
        self.sent_mean = 0.0
        self.games["sentiment_score"] = 0.0

    def _build_popularity(self):
        if "num_votes" in self.games.columns:
            pop_counts = self.games.set_index("id")["num_votes"].reindex(self.meta_ids).fillna(0).astype(float)
        else:
            pop_counts = pd.Series(0.0, index=self.meta_ids)

        self.pop_norm = (pop_counts - pop_counts.min()) / (pop_counts.max() - pop_counts.min() + 1e-9)
        self.pop_norm = self.pop_norm.fillna(0.0)
        self.games["popularity_norm"] = self.games["id"].map(self.pop_norm).fillna(0.0)

    def _get_tokens_series(self, df, col):
        if col not in df.columns:
            return pd.Series([[]] * len(df), index=df.index)
        return df[col].apply(self._to_tokens)

    def _to_tokens(self, x):
        if x is None:
            return []
        if isinstance(x, float) and pd.isna(x):
            return []
        if isinstance(x, list):
            return [self.norm_token(t) for t in x if str(t).strip()]

        s = str(x).strip()
        if not s:
            return []

        s = s.replace("[", "").replace("]", "").replace("'", "").replace('"', "")

        if "|" in s:
            parts = s.split("|")
        elif "," in s:
            parts = s.split(",")
        else:
            parts = [s]

        return [self.norm_token(p) for p in parts if str(p).strip()]

    def _build_tokens(self):
        self.mech_tokens = self._get_tokens_series(self.df_meta_clean, self.MECH_COL)
        self.cat_tokens = self._get_tokens_series(self.df_meta_clean, self.THEME_COL)
        self.fam_tokens = self._get_tokens_series(self.df_meta_clean, self.FAMILY_COL)
        self.pub_tokens = self._get_tokens_series(self.df_meta_clean, self.PUB_COL)

    # -----------------------------
    # Search / title resolution
    # -----------------------------
    def search_titles(self, query, topn=10):
        df_names = self.df_meta_clean[["name"]].copy()
        df_names["name_norm"] = df_names["name"].fillna("").apply(self.norm_token)

        q = self.norm_token(query)
        if not q:
            return pd.DataFrame(columns=["id", "name"])

        exact = df_names[df_names["name_norm"] == q].reset_index()[["id", "name"]]
        if len(exact) > 0:
            return exact.head(topn)

        cand = df_names[df_names["name_norm"].str.contains(re.escape(q), na=False)].reset_index()[["id", "name"]]

        if "num_votes" in self.games.columns:
            cand = cand.merge(self.games[["id", "num_votes"]], on="id", how="left")
            cand["num_votes"] = pd.to_numeric(cand["num_votes"], errors="coerce").fillna(0)
            cand = cand.sort_values("num_votes", ascending=False).drop(columns=["num_votes"])

        return cand.head(topn)

    def resolve_titles_to_ids(self, titles, pick="auto"):
        seed_ids = []
        candidates_info = []

        for t in titles:
            matches = self.search_titles(t, topn=10)

            if len(matches) == 0:
                candidates_info.append((t, []))
                continue

            ids = matches["id"].tolist()
            candidates_info.append((t, ids))

            if pick == "all":
                seed_ids.extend(ids)
            else:
                seed_ids.append(int(ids[0]))

        seen = set()
        uniq = []
        for x in seed_ids:
            if int(x) not in seen:
                uniq.append(int(x))
                seen.add(int(x))

        return uniq, candidates_info

    # -----------------------------
    # Trait expansion
    # -----------------------------
    def expand_traits(self, wanted_categories=None, wanted_mechanics=None):
        wanted_categories = wanted_categories or []
        wanted_mechanics = wanted_mechanics or []

        cat_out = list(wanted_categories)
        mech_out = list(wanted_mechanics)

        for item in wanted_categories:
            key = str(item).strip().lower()
            if key in self.TRAIT_EXPANSIONS:
                cat_out.extend(self.TRAIT_EXPANSIONS[key].get("categories", []))
                mech_out.extend(self.TRAIT_EXPANSIONS[key].get("mechanics", []))

        cat_out = list(dict.fromkeys([str(x).strip() for x in cat_out if str(x).strip()]))
        mech_out = list(dict.fromkeys([str(x).strip() for x in mech_out if str(x).strip()]))

        return cat_out, mech_out

    # -----------------------------
    # Core recommenders
    # -----------------------------
    def topk_from_sim(self, seed_ids, sim_csr, k=1200, strategy="mean"):
        seed_idxs = [self.id_to_idx[sid] for sid in seed_ids if sid in self.id_to_idx]
        if not seed_idxs:
            return pd.Series(dtype=float)

        scores = defaultdict(float)
        counts = defaultdict(int)

        for si in seed_idxs:
            row = sim_csr.getrow(si)
            for c, v in zip(row.indices, row.data):
                gid = self.idx_to_id[c]
                if strategy == "max":
                    scores[gid] = max(scores[gid], float(v))
                else:
                    scores[gid] += float(v)
                    counts[gid] += 1

        if strategy != "max":
            for gid in list(scores.keys()):
                scores[gid] /= max(counts[gid], 1)

        for sid in seed_ids:
            scores.pop(int(sid), None)

        items = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:k]
        return pd.Series(dict(items), dtype=float)

    def recommend_by_titles(
        self,
        query_titles,
        top_n=100,
        w_text=0.35,
        w_emb=0.35,
        w_sent=0.10,
        w_pop=0.20,
        candidate_k=1200,
        pick="auto"
    ):
        seed_ids, _ = self.resolve_titles_to_ids(query_titles, pick=pick)
        seed_ids = [sid for sid in seed_ids if sid in self.id_to_idx]

        if len(seed_ids) == 0:
            return pd.DataFrame(columns=["id", "name", "score_like"])

        desc_s = self.topk_from_sim(seed_ids, self.desc_sim, k=candidate_k).reindex(self.meta_ids).fillna(0.0)
        cont_s = self.topk_from_sim(seed_ids, self.content_sim, k=candidate_k).reindex(self.meta_ids).fillna(0.0)
        emb_s = self.topk_from_sim(seed_ids, self.emb_sim, k=candidate_k).reindex(self.meta_ids).fillna(0.0)

        text_norm = self.safe_minmax(0.5 * desc_s + 0.5 * cont_s, self.meta_ids)
        emb_norm = self.safe_minmax(emb_s, self.meta_ids)

        if self.sent_summary is not None and "avg_sentiment_score" in self.sent_summary.columns:
            sent = self.sent_summary["avg_sentiment_score"].reindex(self.meta_ids).fillna(self.sent_mean)
            sent_norm = self.safe_minmax(sent, self.meta_ids)
        else:
            sent_norm = pd.Series(0.0, index=self.meta_ids)

        pop = self.pop_norm.reindex(self.meta_ids).fillna(0.0)

        score_like = w_text * text_norm + w_emb * emb_norm + w_sent * sent_norm + w_pop * pop

        for sid in seed_ids:
            if sid in score_like.index:
                score_like.loc[sid] = -1

        rec_ids = score_like.sort_values(ascending=False).head(top_n).index.astype(int).tolist()

        seed_mech = set().union(*[set(self.mech_tokens.loc[sid]) for sid in seed_ids if sid in self.mech_tokens.index]) if len(seed_ids) > 0 else set()
        seed_cat = set().union(*[set(self.cat_tokens.loc[sid]) for sid in seed_ids if sid in self.cat_tokens.index]) if len(seed_ids) > 0 else set()
        seed_pub = set().union(*[set(self.pub_tokens.loc[sid]) for sid in seed_ids if sid in self.pub_tokens.index]) if len(seed_ids) > 0 else set()

        out = []
        for gid in rec_ids:
            m = set(self.mech_tokens.loc[gid]) if gid in self.mech_tokens.index else set()
            c = set(self.cat_tokens.loc[gid]) if gid in self.cat_tokens.index else set()
            p = set(self.pub_tokens.loc[gid]) if gid in self.pub_tokens.index else set()

            out.append({
                "id": gid,
                "name": self.df_meta_clean.loc[gid, "name"] if gid in self.df_meta_clean.index else "",
                "score_like": float(score_like.loc[gid]),
                "matched_mechanics": sorted(list(m & seed_mech))[:8],
                "matched_categories": sorted(list(c & seed_cat))[:8],
                "matched_publishers": sorted(list(p & seed_pub))[:6],
            })

        return pd.DataFrame(out).sort_values("score_like", ascending=False).reset_index(drop=True)

    def build_type_candidates(
        self,
        games_df,
        wanted_categories=None,
        wanted_mechanics=None,
        wanted_families=None,
        wanted_publishers=None,
        min_rating=None,
        max_weight=None,
        difficulty_label=None
    ):
        wanted_categories = wanted_categories or []
        wanted_mechanics = wanted_mechanics or []
        wanted_families = wanted_families or []
        wanted_publishers = wanted_publishers or []

        df = games_df.copy()

        if self.THEME_COL in df.columns:
            df["matched_categories"] = df[self.THEME_COL].apply(lambda x: self.overlap_items(x, wanted_categories))
            df["score_theme"] = df[self.THEME_COL].apply(lambda x: self.overlap_score(x, wanted_categories))
        else:
            df["matched_categories"] = [[] for _ in range(len(df))]
            df["score_theme"] = 0.0

        if self.MECH_COL in df.columns:
            df["matched_mechanics"] = df[self.MECH_COL].apply(lambda x: self.overlap_items(x, wanted_mechanics))
            df["score_mech"] = df[self.MECH_COL].apply(lambda x: self.overlap_score(x, wanted_mechanics))
        else:
            df["matched_mechanics"] = [[] for _ in range(len(df))]
            df["score_mech"] = 0.0

        if self.FAMILY_COL in df.columns:
            df["matched_families"] = df[self.FAMILY_COL].apply(lambda x: self.overlap_items(x, wanted_families))
            df["score_family"] = df[self.FAMILY_COL].apply(lambda x: self.overlap_score(x, wanted_families))
        else:
            df["matched_families"] = [[] for _ in range(len(df))]
            df["score_family"] = 0.0

        if self.PUB_COL in df.columns:
            df["matched_publishers"] = df[self.PUB_COL].apply(lambda x: self.overlap_items(x, wanted_publishers))
            df["score_publisher"] = df[self.PUB_COL].apply(lambda x: self.overlap_score(x, wanted_publishers))
        else:
            df["matched_publishers"] = [[] for _ in range(len(df))]
            df["score_publisher"] = 0.0

        df["score_trait"] = (
            0.40 * df["score_theme"] +
            0.35 * df["score_mech"] +
            0.15 * df["score_family"] +
            0.10 * df["score_publisher"]
        )

        if difficulty_label is not None:
            diff = str(difficulty_label).strip().lower()
            if "complexity" in df.columns:
                s = pd.to_numeric(df["complexity"], errors="coerce")
                mask = pd.Series(True, index=df.index)

                if diff == "low":
                    mask &= (s <= 2.0)
                elif diff == "medium":
                    mask &= (s > 2.0) & (s <= 3.0)
                elif diff == "high":
                    mask &= (s > 3.0)

                df = df[mask.fillna(False)].copy()

        if min_rating is not None and "avg_rating" in df.columns:
            df = df[pd.to_numeric(df["avg_rating"], errors="coerce") >= min_rating].copy()

        if max_weight is not None and "complexity" in df.columns:
            df = df[pd.to_numeric(df["complexity"], errors="coerce") <= max_weight].copy()

        trait_cols = ["score_theme", "score_mech", "score_family", "score_publisher"]
        df = df[df[trait_cols].sum(axis=1) > 0].copy()

        return df

    def make_reason(self, row):
        reasons = []

        cats = self.to_list_safe(row.get("matched_categories", []))
        mechs = self.to_list_safe(row.get("matched_mechanics", []))
        fams = self.to_list_safe(row.get("matched_families", []))
        pubs = self.to_list_safe(row.get("matched_publishers", []))

        if len(cats) > 0:
            reasons.append("Categories: " + ", ".join(cats))
        if len(mechs) > 0:
            reasons.append("Mechanics: " + ", ".join(mechs))
        if len(fams) > 0:
            reasons.append("Families: " + ", ".join(fams))
        if len(pubs) > 0:
            reasons.append("Publishers: " + ", ".join(pubs))

        return " | ".join(reasons) if reasons else "No explicit trait match recorded"

    def discover(
        self,
        query_titles=None,
        wanted_categories=None,
        wanted_mechanics=None,
        wanted_families=None,
        wanted_publishers=None,
        difficulty_label=None,
        top_n=20,
        alpha_title=0.65,
        alpha_trait=0.35,
        exclude_query_titles=True
    ):
        query_titles = query_titles or []
        wanted_categories = wanted_categories or []
        wanted_mechanics = wanted_mechanics or []
        wanted_families = wanted_families or []
        wanted_publishers = wanted_publishers or []

        wanted_categories, wanted_mechanics = self.expand_traits(
            wanted_categories=wanted_categories,
            wanted_mechanics=wanted_mechanics
        )

        has_title = len(query_titles) > 0
        # difficulty_label is intentionally excluded — it is applied as a
        # post-processing filter on every path so it works in title-only mode.
        has_trait = any([
            len(wanted_categories) > 0,
            len(wanted_mechanics) > 0,
            len(wanted_families) > 0,
            len(wanted_publishers) > 0,
        ])

        if not has_title and not has_trait:
            raise ValueError("Provide at least one title or one trait.")

        title_df = None
        if has_title:
            title_df = self.recommend_by_titles(
                query_titles=query_titles,
                top_n=max(top_n * 5, 100)
            ).copy()

        trait_df = None
        if has_trait:
            trait_df = self.build_type_candidates(
                games_df=self.games,
                wanted_categories=wanted_categories,
                wanted_mechanics=wanted_mechanics,
                wanted_families=wanted_families,
                wanted_publishers=wanted_publishers,
                difficulty_label=difficulty_label
            ).copy()

            keep_cols = [
                "id", "name",
                "matched_categories", "matched_mechanics",
                "matched_families", "matched_publishers",
                "score_theme", "score_mech", "score_family",
                "score_publisher", "score_trait"
            ]
            keep_cols = [c for c in keep_cols if c in trait_df.columns]
            trait_df = trait_df[keep_cols].copy()

        meta_cols = ["id", "name", "avg_rating", "complexity", "yearpublished", "sentiment_score", "num_votes"]
        meta_cols = [c for c in meta_cols if c in self.games.columns]

        if has_title and not has_trait:
            out = title_df.copy()
            out = out.merge(self.games[meta_cols].drop_duplicates("id"), on=["id", "name"], how="left")
            out = self._apply_difficulty_filter(out, difficulty_label)
            out["score_trait"] = 0.0
            out["final_score"] = out["score_like"]
            out["reason"] = out.apply(self.make_reason, axis=1)
            return out.sort_values(
                ["final_score", "avg_rating", "num_votes"],
                ascending=[False, False, False]
            ).head(top_n).reset_index(drop=True)

        if has_trait and not has_title:
            out = trait_df.copy()
            out = out.merge(self.games[meta_cols].drop_duplicates("id"), on=["id", "name"], how="left")
            out["score_like"] = 0.0

            out["rating_norm"] = self.safe_minmax(pd.to_numeric(out["avg_rating"], errors="coerce").fillna(0.0), out.index)
            out["votes_norm"] = self.safe_minmax(np.log1p(pd.to_numeric(out["num_votes"], errors="coerce").fillna(0.0)), out.index)
            out["sent_norm"] = self.safe_minmax(pd.to_numeric(out["sentiment_score"], errors="coerce").fillna(0.0), out.index)

            out["final_score"] = (
                0.70 * out["score_trait"] +
                0.15 * out["rating_norm"] +
                0.10 * out["votes_norm"] +
                0.05 * out["sent_norm"]
            )

            out["reason"] = out.apply(self.make_reason, axis=1)
            out = self._apply_difficulty_filter(out, difficulty_label)
            return out.sort_values(
                ["final_score", "score_trait", "avg_rating", "num_votes"],
                ascending=[False, False, False, False]
            ).head(top_n).reset_index(drop=True)

        out = title_df.merge(  # combined path
            trait_df,
            on=["id", "name"],
            how="outer",
            suffixes=("_title", "_trait")
        ).copy()

        if "score_like" not in out.columns:
            out["score_like"] = 0.0
        out["score_like"] = out["score_like"].fillna(0.0)

        for col in ["matched_categories", "matched_mechanics", "matched_families", "matched_publishers"]:
            out = self.coalesce_list_columns(out, col)

        for col in ["score_theme", "score_mech", "score_family", "score_publisher", "score_trait"]:
            if col not in out.columns:
                out[col] = 0.0
            out[col] = out[col].fillna(0.0)

        out["score_trait"] = (
            0.40 * out["score_theme"] +
            0.35 * out["score_mech"] +
            0.15 * out["score_family"] +
            0.10 * out["score_publisher"]
        )

        out = out.merge(self.games[meta_cols].drop_duplicates("id"), on=["id", "name"], how="left")

        if exclude_query_titles:
            query_titles_norm = {str(t).strip().lower() for t in query_titles}
            out = out[~out["name"].astype(str).str.strip().str.lower().isin(query_titles_norm)].copy()

        out["rating_norm"] = self.safe_minmax(pd.to_numeric(out["avg_rating"], errors="coerce").fillna(0.0), out.index)
        out["votes_norm"] = self.safe_minmax(np.log1p(pd.to_numeric(out["num_votes"], errors="coerce").fillna(0.0)), out.index)
        out["sent_norm"] = self.safe_minmax(pd.to_numeric(out["sentiment_score"], errors="coerce").fillna(0.0), out.index)

        out["final_score"] = (
            alpha_title * out["score_like"] +
            alpha_trait * out["score_trait"] +
            0.08 * out["rating_norm"] +
            0.04 * out["votes_norm"] +
            0.03 * out["sent_norm"]
        )

        out["reason"] = out.apply(self.make_reason, axis=1)
        out = self._apply_difficulty_filter(out, difficulty_label)

        return out.sort_values(
            ["final_score", "score_like", "score_trait", "avg_rating", "num_votes"],
            ascending=[False, False, False, False, False]
        ).head(top_n).reset_index(drop=True)

    def _apply_difficulty_filter(self, df: pd.DataFrame, difficulty_label) -> pd.DataFrame:
        """Post-processing difficulty filter applied to any result path."""
        if difficulty_label is None or "complexity" not in df.columns:
            return df
        diff = str(difficulty_label).strip().lower()
        comp = pd.to_numeric(df["complexity"], errors="coerce")
        if diff == "low":
            return df[comp.fillna(99) <= 2.0].copy()
        if diff == "medium":
            return df[(comp.fillna(99) > 2.0) & (comp.fillna(99) <= 3.0)].copy()
        if diff == "high":
            return df[comp.fillna(0) > 3.0].copy()
        return df

    # -----------------------------
    # Convenience helpers
    # -----------------------------
    def format_results(self, df):
        if df is None or len(df) == 0:
            return pd.DataFrame(columns=["name", "final_score", "score_like", "score_trait", "avg_rating", "num_votes", "reason"])

        out = df.copy()

        for c in ["final_score", "score_like", "score_trait", "avg_rating"]:
            if c in out.columns:
                out[c] = pd.to_numeric(out[c], errors="coerce").round(4)

        if "num_votes" in out.columns:
            out["num_votes"] = pd.to_numeric(out["num_votes"], errors="coerce").fillna(0).astype(int)

        preferred_cols = ["name", "final_score", "score_like", "score_trait", "avg_rating", "num_votes", "reason"]
        preferred_cols = [c for c in preferred_cols if c in out.columns]

        return out[preferred_cols].copy()
