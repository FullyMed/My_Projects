import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
from recommender import BoardGameDiscoveryEngine
import theme

st.set_page_config(
    page_title="Recommendation — Board Game Discovery Engine",
    page_icon="🎲",
    layout="wide",
)

# Sidebar
st.sidebar.title("⚙ Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)

mode = st.sidebar.selectbox(
    "Recommendation Mode",
    ["Combined", "Title-Based", "Trait-Based"],
)

top_n = st.sidebar.slider("Top N Results", min_value=5, max_value=20, value=10, step=1)

difficulty_label = st.sidebar.selectbox(
    "Difficulty Filter",
    ["Any", "low", "medium", "high"],
)
if difficulty_label == "Any":
    difficulty_label = None

st.sidebar.markdown("---")
st.sidebar.caption("Board Game Discovery Engine — interactive recommendation demo.")

# Engine
PROJECT_ROOT = Path(__file__).parent.parent.parent


@st.cache_resource
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


# Session state defaults
for key in ["title_input", "category_input", "mechanic_input", "family_input", "publisher_input"]:
    if key not in st.session_state:
        st.session_state[key] = ""

# Header
st.markdown('<div class="main-title"><span class="title-icon">🎲</span> Recommendation Engine</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">Discover board games by title similarity, trait preferences, or both.</div>',
    unsafe_allow_html=True,
)

# Mode description
mode_descriptions = {
    "Title-Based": "Recommendations driven by semantic similarity to your selected seed games — content, embeddings, sentiment, and popularity.",
    "Trait-Based": "Explore games using gameplay characteristics: categories, mechanics, families, publishers, and complexity level.",
    "Combined": "Combines seed-game similarity with trait filtering for guided discovery that balances taste and explicit preferences.",
}
st.markdown(
    f'<div class="info-box">{mode_descriptions[mode]}</div>',
    unsafe_allow_html=True,
)

# Example button
ex_col, caption_col = st.columns([1, 5])
with ex_col:
    if st.button("Try Example"):
        st.session_state["title_input"] = "Splendor, Azul"
        st.session_state["category_input"] = "Strategy, Family"
        st.session_state["mechanic_input"] = ""
        st.session_state["family_input"] = ""
        st.session_state["publisher_input"] = ""
with caption_col:
    st.caption("Loads a quick demo query so you can test the system instantly.")

# Input fields
col1, col2 = st.columns(2)
with col1:
    title_input = st.text_input(
        "Favorite Game Titles",
        value=st.session_state["title_input"],
        placeholder="Example: Splendor, Azul",
    )
    st.session_state["title_input"] = title_input

with col2:
    category_input = st.text_input(
        "Preferred Categories",
        value=st.session_state["category_input"],
        placeholder="Example: Strategy, Family, Horror",
    )
    st.session_state["category_input"] = category_input

col3, col4 = st.columns(2)
with col3:
    mechanic_input = st.text_input(
        "Preferred Mechanics",
        value=st.session_state["mechanic_input"],
        placeholder="Example: Cooperative Game, Tile Placement",
    )
    st.session_state["mechanic_input"] = mechanic_input

with col4:
    family_input = st.text_input(
        "Preferred Families (optional)",
        value=st.session_state["family_input"],
        placeholder="Example: Family Games",
    )
    st.session_state["family_input"] = family_input

publisher_input = st.text_input(
    "Preferred Publishers (optional)",
    value=st.session_state["publisher_input"],
    placeholder="Example: Asmodee, CMON",
)
st.session_state["publisher_input"] = publisher_input

query_titles = parse_csv_input(title_input)
wanted_categories = parse_csv_input(category_input)
wanted_mechanics = parse_csv_input(mechanic_input)
wanted_families = parse_csv_input(family_input)
wanted_publishers = parse_csv_input(publisher_input)

st.markdown("---")
run_btn = st.button("Get Recommendations", width='stretch')

# Run
if run_btn:
    try:
        formatted = None
        expanded_categories = wanted_categories
        expanded_mechanics = wanted_mechanics

        if mode == "Title-Based":
            if not query_titles:
                st.warning("Please enter at least one game title.")
            else:
                results = engine.discover(
                    query_titles=query_titles,
                    difficulty_label=difficulty_label,
                    top_n=top_n,
                )
                formatted = engine.format_results(results)

        elif mode == "Trait-Based":
            if not any([wanted_categories, wanted_mechanics, wanted_families, wanted_publishers]):
                st.warning("Please enter at least one category, mechanic, family, or publisher.")
            else:
                expanded_categories, expanded_mechanics = engine.expand_traits(
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics,
                )
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
                st.warning("Please enter at least one title or one trait.")
            else:
                expanded_categories, expanded_mechanics = engine.expand_traits(
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics,
                )
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

        if formatted is not None and len(formatted) > 0:
            # System interpretation summary
            st.markdown("---")
            st.markdown('<div class="section-title">System Interpretation</div>', unsafe_allow_html=True)

            ic1, ic2 = st.columns(2)
            with ic1:
                st.markdown(
                    f'<div class="info-box"><b>Input Titles:</b><br>{", ".join(query_titles) if query_titles else "—"}</div>',
                    unsafe_allow_html=True,
                )
            with ic2:
                st.markdown(
                    f'<div class="info-box"><b>Difficulty Filter:</b><br>{difficulty_label if difficulty_label else "Any"}</div>',
                    unsafe_allow_html=True,
                )

            ic3, ic4 = st.columns(2)
            with ic3:
                st.markdown(
                    f'<div class="info-box"><b>Expanded Categories:</b><br>{", ".join(expanded_categories) if expanded_categories else "—"}</div>',
                    unsafe_allow_html=True,
                )
            with ic4:
                st.markdown(
                    f'<div class="info-box"><b>Expanded Mechanics:</b><br>{", ".join(expanded_mechanics) if expanded_mechanics else "—"}</div>',
                    unsafe_allow_html=True,
                )

            # Full table
            st.markdown("---")
            st.markdown('<div class="section-title">Recommendation Table</div>', unsafe_allow_html=True)
            st.dataframe(formatted, width='stretch', height=min(400, max(120, 40 + 35 * len(formatted))))

            # Top-5 cards
            st.markdown("---")
            st.markdown('<div class="section-title">Top Recommendations</div>', unsafe_allow_html=True)

            for _, row in formatted.head(5).iterrows():
                st.markdown('<div class="result-card">', unsafe_allow_html=True)
                st.markdown(
                    f'<div class="card-title">🎲 {row.get("name", "—")}</div>',
                    unsafe_allow_html=True,
                )

                # 3 equal columns — on mobile the CSS stacks them vertically
                mc1, mc2, mc3 = st.columns(3)
                with mc1:
                    st.metric("Final Score", row.get("final_score", "—"))
                with mc2:
                    st.metric("Rating", row.get("avg_rating", "—"))
                with mc3:
                    votes = row.get("num_votes", 0)
                    st.metric("Votes", f'{int(votes):,}' if votes else "—")

                st.markdown(
                    f'<div class="card-reason"><b>Why recommended:</b> {shorten_reason(row.get("reason", "—"))}</div>',
                    unsafe_allow_html=True,
                )
                st.markdown('</div>', unsafe_allow_html=True)

        elif formatted is not None and len(formatted) == 0:
            st.info("No results found for the given inputs. Try broadening your query.")

    except Exception as e:
        st.error(f"An error occurred: {e}")

st.markdown("---")
st.caption("BoardGames Analyzer — Explainable Hybrid Recommendation System · Built with Streamlit")
