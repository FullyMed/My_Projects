import streamlit as st
import pandas as pd
from recommender import BoardGameDiscoveryEngine

st.set_page_config(
    page_title="Board Game Discovery Engine",
    page_icon="🎲",
    layout="wide"
)

# -----------------------------
# Theme helper
# -----------------------------
def apply_theme(theme_mode: str):
    if theme_mode == "Dark":
        st.markdown("""
        <style>
        .stApp {
            background-color: #0e1117;
            color: #fafafa;
        }
        .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
        }
        div[data-baseweb="input"], div[data-baseweb="select"] {
            color: black;
        }
        </style>
        """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <style>
        .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
        }
        </style>
        """, unsafe_allow_html=True)


# -----------------------------
# Load engine
# -----------------------------
@st.cache_resource
def load_engine():
    return BoardGameDiscoveryEngine(base_path=".")

engine = load_engine()

# -----------------------------
# Sidebar
# -----------------------------
st.sidebar.title("⚙ Settings")

theme_mode = st.sidebar.radio(
    "Theme",
    ["Light", "Dark"],
    index=0
)

apply_theme(theme_mode)

mode = st.sidebar.selectbox(
    "Recommendation Mode",
    ["Combined", "Title-Based", "Trait-Based"]
)

top_n = st.sidebar.slider("Top N Results", min_value=5, max_value=20, value=10, step=1)

difficulty_label = st.sidebar.selectbox(
    "Difficulty Filter",
    ["Any", "low", "medium", "high"]
)

if difficulty_label == "Any":
    difficulty_label = None

st.sidebar.markdown("---")
st.sidebar.caption("Simple demo app for the Board Game Discovery Engine project.")

# -----------------------------
# Main UI
# -----------------------------
st.title("🎲 Board Game Discovery Engine")
st.write("Discover board games by title similarity, trait preferences, or both.")

col1, col2 = st.columns(2)

with col1:
    title_input = st.text_input(
        "Favorite Game Titles",
        placeholder="Example: Splendor, Azul"
    )

with col2:
    category_input = st.text_input(
        "Preferred Categories",
        placeholder="Example: Strategy, Family, Horror"
    )

col3, col4 = st.columns(2)

with col3:
    mechanic_input = st.text_input(
        "Preferred Mechanics",
        placeholder="Example: Cooperative Game, Tile Placement"
    )

with col4:
    family_input = st.text_input(
        "Preferred Families (optional)",
        placeholder="Example: Family Games"
    )

publisher_input = st.text_input(
    "Preferred Publishers (optional)",
    placeholder="Example: Asmodee, CMON"
)

def parse_csv_input(text: str):
    if not text or not text.strip():
        return []
    return [x.strip() for x in text.split(",") if x.strip()]

query_titles = parse_csv_input(title_input)
wanted_categories = parse_csv_input(category_input)
wanted_mechanics = parse_csv_input(mechanic_input)
wanted_families = parse_csv_input(family_input)
wanted_publishers = parse_csv_input(publisher_input)

st.markdown("---")

run_btn = st.button("Get Recommendations", use_container_width=True)

if run_btn:
    try:
        if mode == "Title-Based":
            if len(query_titles) == 0:
                st.warning("Please enter at least one game title.")
            else:
                results = engine.discover(
                    query_titles=query_titles,
                    top_n=top_n,
                    difficulty_label=difficulty_label
                )
                formatted = engine.format_results(results)

                st.subheader("Results")
                st.dataframe(formatted, use_container_width=True)

        elif mode == "Trait-Based":
            if len(wanted_categories) == 0 and len(wanted_mechanics) == 0 and len(wanted_families) == 0 and len(wanted_publishers) == 0:
                st.warning("Please enter at least one trait, category, mechanic, family, or publisher.")
            else:
                results = engine.discover(
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics,
                    wanted_families=wanted_families,
                    wanted_publishers=wanted_publishers,
                    difficulty_label=difficulty_label,
                    top_n=top_n
                )
                formatted = engine.format_results(results)

                st.subheader("Results")
                st.dataframe(formatted, use_container_width=True)

        else:  # Combined
            if len(query_titles) == 0 and len(wanted_categories) == 0 and len(wanted_mechanics) == 0 and len(wanted_families) == 0 and len(wanted_publishers) == 0:
                st.warning("Please enter at least one title or one trait.")
            else:
                results = engine.discover(
                    query_titles=query_titles,
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics,
                    wanted_families=wanted_families,
                    wanted_publishers=wanted_publishers,
                    difficulty_label=difficulty_label,
                    top_n=top_n
                )
                formatted = engine.format_results(results)

                st.subheader("Results")
                st.dataframe(formatted, use_container_width=True)

        if "formatted" in locals() and len(formatted) > 0:
            st.markdown("---")
            st.subheader("Top Recommendation Cards")

            for _, row in formatted.head(5).iterrows():
                with st.container():
                    st.markdown(f"### {row.get('name', '-')}")
                    c1, c2, c3 = st.columns(3)
                    c1.metric("Final Score", row.get("final_score", "-"))
                    c2.metric("Rating", row.get("avg_rating", "-"))
                    c3.metric("Votes", row.get("num_votes", "-"))
                    st.write(f"**Reason:** {row.get('reason', '-')}")
                    st.markdown("---")

    except Exception as e:
        st.error(f"An error occurred: {e}")

# -----------------------------
# Footer
# -----------------------------
st.markdown("---")
st.caption("Built with Streamlit for the BoardGames_Analyzer project.")