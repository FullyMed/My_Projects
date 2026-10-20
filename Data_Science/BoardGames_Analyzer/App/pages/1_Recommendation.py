import sys
import html
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
from recommender import BoardGameDiscoveryEngine
import theme

INPUT_MAX_CHARS = 200

st.set_page_config(
    page_title="Recommendations · Board Game Discovery Engine",
    page_icon="🎲",
    layout="wide",
)
theme.set_meta_description(
    "Tell us games you like or traits you want, and get board game suggestions "
    "with the reason behind each one."
)

# Sidebar
st.sidebar.title("Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)

mode = st.sidebar.selectbox(
    "Search by",
    ["Combined", "Title-Based", "Trait-Based"],
)

top_n = st.sidebar.slider("Number of results", min_value=5, max_value=20, value=10, step=1)

# The values are what the engine expects; format_func only changes what the user reads
DIFFICULTY_LABELS = {
    "Any": "Any",
    "low": "Light (BGG weight up to 2)",
    "medium": "Medium (2 to 3)",
    "high": "Heavy (over 3)",
}
difficulty_label = st.sidebar.selectbox(
    "Difficulty",
    list(DIFFICULTY_LABELS),
    format_func=DIFFICULTY_LABELS.get,
)
if difficulty_label == "Any":
    difficulty_label = None

st.sidebar.markdown("---")
st.sidebar.caption("Board Game Discovery Engine, a student research project.")

# Engine
PROJECT_ROOT = Path(__file__).parent.parent.parent


@st.cache_resource(show_spinner="Loading the recommender. The first load takes a few seconds...")
def load_engine():
    return BoardGameDiscoveryEngine(base_path=str(PROJECT_ROOT))


engine = load_engine()


# Helpers
def parse_csv_input(text: str):
    if not text or not text.strip():
        return []
    return [x.strip() for x in text.split(",") if x.strip()]


def shorten_reason(text, limit=200):
    if not isinstance(text, str):
        return "-"
    return text if len(text) <= limit else text[:limit].rstrip() + "..."


def describe_seed_matches(titles):
    """Pair each typed title with the catalog game it resolved to (None if nothing matched).

    Title lookup falls back to substring matching, so showing the resolved game keeps the
    seed choice as transparent as the recommendations themselves.
    """
    _, candidates_info = engine.resolve_titles_to_ids(titles)
    matches = []
    for typed, ids in candidates_info:
        name = engine.df_meta_clean.loc[ids[0], "name"] if ids else None
        matches.append((typed, name))
    return matches


# Session state defaults
for key in ["title_input", "category_input", "mechanic_input", "family_input", "publisher_input"]:
    if key not in st.session_state:
        st.session_state[key] = ""

# Header
st.markdown('<div class="main-title">Find your next game</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">Start from games you already like, from traits you want, or from both.</div>',
    unsafe_allow_html=True,
)

# Mode description
mode_descriptions = {
    "Title-Based": "Name a few games you like. You'll get games with similar descriptions, mechanics and themes, nudged toward titles lots of people have rated.",
    "Trait-Based": "No favorites in mind? Pick categories, mechanics, families or publishers, and the games that match the most of them come first.",
    "Combined": "Give both: games you like and traits you want. Games that are similar to your picks and match your traits rank highest.",
}
st.markdown(
    f'<div class="info-box">{mode_descriptions[mode]}</div>',
    unsafe_allow_html=True,
)

# Example button
ex_col, caption_col = st.columns([1, 3], vertical_alignment="center")
with ex_col:
    if st.button("Try an example", key="try_example"):
        st.session_state["title_input"] = "Splendor, Azul"
        st.session_state["category_input"] = "Strategy, Family"
        st.session_state["mechanic_input"] = ""
        st.session_state["family_input"] = ""
        st.session_state["publisher_input"] = ""
with caption_col:
    st.caption("Fills in Splendor and Azul with Strategy and Family so you can see how it works.")

# Input fields
col1, col2 = st.columns(2)
with col1:
    title_input = st.text_input(
        "Games you like",
        value=st.session_state["title_input"],
        placeholder="e.g. Splendor, Azul",
        max_chars=INPUT_MAX_CHARS,
    )
    st.session_state["title_input"] = title_input

with col2:
    category_input = st.text_input(
        "Categories",
        value=st.session_state["category_input"],
        placeholder="e.g. Strategy, Family, Horror",
        max_chars=INPUT_MAX_CHARS,
    )
    st.session_state["category_input"] = category_input

col3, col4 = st.columns(2)
with col3:
    mechanic_input = st.text_input(
        "Mechanics",
        value=st.session_state["mechanic_input"],
        placeholder="e.g. Cooperative Game, Tile Placement",
        max_chars=INPUT_MAX_CHARS,
    )
    st.session_state["mechanic_input"] = mechanic_input

with col4:
    family_input = st.text_input(
        "Families (optional)",
        value=st.session_state["family_input"],
        # Families are exact BGG family names ("Group: Name"), so the example must be a real one
        placeholder="e.g. Components: Miniatures, Crowdfunding: Kickstarter",
        max_chars=INPUT_MAX_CHARS,
    )
    st.session_state["family_input"] = family_input

publisher_input = st.text_input(
    "Publishers (optional)",
    value=st.session_state["publisher_input"],
    placeholder="e.g. Asmodee, CMON Global Limited",
    max_chars=INPUT_MAX_CHARS,
)
st.session_state["publisher_input"] = publisher_input

query_titles = parse_csv_input(title_input)
wanted_categories = parse_csv_input(category_input)
wanted_mechanics = parse_csv_input(mechanic_input)
wanted_families = parse_csv_input(family_input)
wanted_publishers = parse_csv_input(publisher_input)

st.markdown("---")
run_btn = st.button("Get recommendations", width='stretch')

# Run
if run_btn:
    try:
        formatted = None
        expanded_categories = wanted_categories
        expanded_mechanics = wanted_mechanics
        seed_matches = []

        if mode == "Title-Based":
            if not query_titles:
                st.warning("Type at least one game you like.")
            else:
                seed_matches = describe_seed_matches(query_titles)
                with st.spinner("Finding games..."):
                    results = engine.discover(
                        query_titles=query_titles,
                        difficulty_label=difficulty_label,
                        top_n=top_n,
                    )
                    formatted = engine.format_results(results)

        elif mode == "Trait-Based":
            if not any([wanted_categories, wanted_mechanics, wanted_families, wanted_publishers]):
                st.warning("Add at least one category, mechanic, family or publisher.")
            else:
                expanded_categories, expanded_mechanics = engine.expand_traits(
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics,
                )
                with st.spinner("Finding games..."):
                    results = engine.discover(
                        wanted_categories=wanted_categories,
                        wanted_mechanics=wanted_mechanics,
                        wanted_families=wanted_families,
                        wanted_publishers=wanted_publishers,
                        difficulty_label=difficulty_label,
                        top_n=top_n,
                    )
                    formatted = engine.format_results(results)

        else:  # Combined
            if not any([query_titles, wanted_categories, wanted_mechanics, wanted_families, wanted_publishers]):
                st.warning("Type a game you like or add at least one trait.")
            else:
                seed_matches = describe_seed_matches(query_titles) if query_titles else []
                expanded_categories, expanded_mechanics = engine.expand_traits(
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics,
                )
                with st.spinner("Finding games..."):
                    results = engine.discover(
                        query_titles=query_titles,
                        wanted_categories=wanted_categories,
                        wanted_mechanics=wanted_mechanics,
                        wanted_families=wanted_families,
                        wanted_publishers=wanted_publishers,
                        difficulty_label=difficulty_label,
                        top_n=top_n,
                    )
                    formatted = engine.format_results(results)

        unmatched_titles = [typed for typed, name in seed_matches if name is None]
        if unmatched_titles:
            st.warning(
                f"We couldn't find: {', '.join(unmatched_titles)}. "
                "Check the spelling or try the full title. We left it out of this search."
            )

        if formatted is not None and len(formatted) > 0:
            # System interpretation summary
            st.markdown("---")
            st.markdown('<div class="section-title">What we searched for</div>', unsafe_allow_html=True)

            if seed_matches:
                seed_lines = "<br>".join(
                    f'{html.escape(typed)} → {html.escape(name) if name else "<i>no match</i>"}'
                    for typed, name in seed_matches
                )
            else:
                seed_lines = "—"

            ic1, ic2 = st.columns(2)
            with ic1:
                st.markdown(
                    f'<div class="info-box"><b>Your games (what you typed → what we matched):</b><br>{seed_lines}</div>',
                    unsafe_allow_html=True,
                )
            with ic2:
                st.markdown(
                    f'<div class="info-box"><b>Difficulty:</b><br>{html.escape(DIFFICULTY_LABELS[difficulty_label]) if difficulty_label else "Any"}</div>',
                    unsafe_allow_html=True,
                )

            ic3, ic4 = st.columns(2)
            with ic3:
                st.markdown(
                    f'<div class="info-box"><b>Categories we searched (broad words expand to related BGG terms):</b><br>{html.escape(", ".join(expanded_categories)) if expanded_categories else "—"}</div>',
                    unsafe_allow_html=True,
                )
            with ic4:
                st.markdown(
                    f'<div class="info-box"><b>Mechanics we searched:</b><br>{html.escape(", ".join(expanded_mechanics)) if expanded_mechanics else "—"}</div>',
                    unsafe_allow_html=True,
                )

            # Top-5 cards
            st.markdown("---")
            st.markdown('<div class="section-title">Top picks</div>', unsafe_allow_html=True)

            for rank, (_, row) in enumerate(formatted.head(5).iterrows()):
                # Each st.markdown call is its own element, so an opening/closing <div> pair
                # can't wrap widgets; a keyed container can (theme.py styles .st-key-result_card_*)
                with st.container(key=f"result_card_{rank}"):
                    st.markdown(
                        f'<div class="card-title">{html.escape(str(row.get("name", "—")))}</div>',
                        unsafe_allow_html=True,
                    )

                    # 3 equal columns — on mobile the CSS stacks them vertically
                    mc1, mc2, mc3 = st.columns(3)
                    with mc1:
                        st.metric("Match score", row.get("final_score", "—"))
                    with mc2:
                        st.metric("BGG rating", row.get("avg_rating", "—"))
                    with mc3:
                        votes = row.get("num_votes", 0)
                        st.metric("Ratings", f'{int(votes):,}' if votes else "—")

                    st.markdown(
                        f'<div class="card-reason"><b>Why this game:</b> {html.escape(shorten_reason(row.get("reason", "—")))}</div>',
                        unsafe_allow_html=True,
                    )

            # Full table, with plain column names (the engine's names are for code)
            st.markdown("---")
            st.markdown('<div class="section-title">All results</div>', unsafe_allow_html=True)
            table = formatted.rename(columns={
                "name": "Game",
                "final_score": "Match score",
                "score_like": "Title score",
                "score_trait": "Trait score",
                "avg_rating": "BGG rating",
                "num_votes": "Ratings",
                "reason": "Why",
            })
            st.dataframe(
                table,
                width='stretch',
                hide_index=True,
                height=min(400, max(120, 40 + 35 * len(table))),
                column_config={
                    "Match score": st.column_config.NumberColumn(format="%.3f"),
                    "Title score": st.column_config.NumberColumn(format="%.3f"),
                    "Trait score": st.column_config.NumberColumn(format="%.3f"),
                    "BGG rating": st.column_config.NumberColumn(format="%.2f"),
                    "Ratings": st.column_config.NumberColumn(format="localized"),
                    "Why": st.column_config.TextColumn(width="large"),
                },
            )

        elif formatted is not None and len(formatted) == 0:
            theme.render_not_found(
                title="No matches",
                message="Nothing matched that search. Try fewer traits, a different difficulty, or another game title.",
                icon="search",
            )

    except Exception as e:
        print(f"[1_Recommendation] error handling request: {e}", file=sys.stderr)
        st.error("Something went wrong on our side. Try a different search.")

st.markdown("---")
st.caption("BoardGames Analyzer · board game recommendations with reasons · built with Streamlit")
