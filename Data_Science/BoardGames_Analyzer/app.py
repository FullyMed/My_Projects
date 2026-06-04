import streamlit as st
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
            background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
            color: #f8fafc;
        }

        [data-testid="stSidebar"] {
            background: rgba(15, 23, 42, 0.96);
            border-right: 1px solid rgba(148, 163, 184, 0.15);
        }

        .main-title {
            font-size: 3rem;
            font-weight: 800;
            color: #f8fafc;
            margin-bottom: 0.25rem;
        }

        .subtitle {
            font-size: 1.15rem;
            color: #cbd5e1;
            margin-bottom: 1.2rem;
        }

        .section-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: #f8fafc;
            margin-top: 0.8rem;
            margin-bottom: 0.6rem;
        }

        .info-box {
            background: rgba(30, 41, 59, 0.88);
            border: 1px solid rgba(148, 163, 184, 0.22);
            border-radius: 14px;
            padding: 14px 16px;
            color: #e2e8f0;
            margin-bottom: 14px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.18);
        }

        .result-card {
            background: rgba(15, 23, 42, 0.96);
            border: 1px solid rgba(148, 163, 184, 0.18);
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.28);
        }

        .card-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: #f8fafc;
            margin-bottom: 0.35rem;
        }

        .card-reason {
            color: #cbd5e1;
            font-size: 0.98rem;
            line-height: 1.5;
            margin-top: 0.5rem;
        }

        div[data-baseweb="input"] > div,
        div[data-baseweb="select"] > div {
            background-color: rgba(51, 65, 85, 0.92) !important;
            color: #f8fafc !important;
            border: 1px solid rgba(148, 163, 184, 0.25) !important;
            border-radius: 12px !important;
        }

        input, textarea {
            color: #f8fafc !important;
        }

        .stButton > button {
            width: 100%;
            border-radius: 12px;
            height: 3rem;
            font-weight: 700;
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: linear-gradient(90deg, #2563eb, #7c3aed);
            color: white;
        }

        .stButton > button:hover {
            color: white;
            border: 1px solid rgba(148, 163, 184, 0.35);
        }

        hr {
            border: none;
            border-top: 1px solid rgba(148, 163, 184, 0.18);
            margin-top: 1.2rem;
            margin-bottom: 1.2rem;
        }
        </style>
        """, unsafe_allow_html=True)

    else:
        st.markdown("""
        <style>
        .stApp {
            background: #f8fafc;
            color: #0f172a;
        }

        [data-testid="stSidebar"] {
            background: #ffffff;
            border-right: 1px solid #e2e8f0;
        }

        .main-title {
            font-size: 3rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.25rem;
        }

        .subtitle {
            font-size: 1.15rem;
            color: #475569;
            margin-bottom: 1.2rem;
        }

        .section-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0.8rem;
            margin-bottom: 0.6rem;
        }

        .info-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px 16px;
            color: #1e293b;
            margin-bottom: 14px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
        }

        .result-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 16px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
        }

        .card-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 0.35rem;
        }

        .card-reason {
            color: #475569;
            font-size: 0.98rem;
            line-height: 1.5;
            margin-top: 0.5rem;
        }

        div[data-baseweb="input"] > div,
        div[data-baseweb="select"] > div {
            background-color: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
        }

        input, textarea {
            color: #0f172a !important;
        }

        .stButton > button {
            width: 100%;
            border-radius: 12px;
            height: 3rem;
            font-weight: 700;
            border: 1px solid rgba(99, 102, 241, 0.2);
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            color: white;
        }

        .stButton > button:hover {
            color: white;
            border: 1px solid rgba(99, 102, 241, 0.35);
        }

        hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin-top: 1.2rem;
            margin-bottom: 1.2rem;
        }
        </style>
        """, unsafe_allow_html=True)


# -----------------------------
# Cached engine
# -----------------------------
@st.cache_resource
def load_engine():
    return BoardGameDiscoveryEngine(base_path=".")


engine = load_engine()

# -----------------------------
# Helpers
# -----------------------------
def parse_csv_input(text: str):
    if not text or not text.strip():
        return []
    return [x.strip() for x in text.split(",") if x.strip()]


def shorten_reason(text, limit=180):
    if not isinstance(text, str):
        return "-"
    return text if len(text) <= limit else text[:limit].rstrip() + "..."


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

top_n = st.sidebar.slider(
    "Top N Results",
    min_value=5,
    max_value=20,
    value=10,
    step=1
)

difficulty_label = st.sidebar.selectbox(
    "Difficulty Filter",
    ["Any", "low", "medium", "high"]
)

if difficulty_label == "Any":
    difficulty_label = None

st.sidebar.markdown("---")
st.sidebar.caption("Simple demo app for the Board Game Discovery Engine project.")

# -----------------------------
# Session state defaults
# -----------------------------
if "title_input" not in st.session_state:
    st.session_state["title_input"] = ""
if "category_input" not in st.session_state:
    st.session_state["category_input"] = ""
if "mechanic_input" not in st.session_state:
    st.session_state["mechanic_input"] = ""
if "family_input" not in st.session_state:
    st.session_state["family_input"] = ""
if "publisher_input" not in st.session_state:
    st.session_state["publisher_input"] = ""

# -----------------------------
# Main header
# -----------------------------
st.markdown('<div class="main-title">🎲 Board Game Discovery Engine</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">Discover board games by title similarity, trait preferences, or both.</div>',
    unsafe_allow_html=True
)

# -----------------------------
# Recommendation logic
# -----------------------------
st.markdown('<div class="section-title">🧠 Recommendation Logic</div>', unsafe_allow_html=True)

if mode == "Title-Based":
    st.markdown(
        '<div class="info-box">Using similarity from selected games based on content, embeddings, sentiment, and popularity.</div>',
        unsafe_allow_html=True
    )
elif mode == "Trait-Based":
    st.markdown(
        '<div class="info-box">Using category, mechanics, family, publisher, and difficulty filtering to match user preferences.</div>',
        unsafe_allow_html=True
    )
else:
    st.markdown(
        '<div class="info-box">Combining similarity-based recommendations with trait matching to balance user taste and explicit intent.</div>',
        unsafe_allow_html=True
    )

# -----------------------------
# Example button
# -----------------------------
example_col1, example_col2 = st.columns([1, 4])

with example_col1:
    if st.button("Try Example"):
        st.session_state["title_input"] = "Splendor, Azul"
        st.session_state["category_input"] = "Strategy, Family"
        st.session_state["mechanic_input"] = ""
        st.session_state["family_input"] = ""
        st.session_state["publisher_input"] = ""

with example_col2:
    st.caption("Loads a quick demo query so you can test the system instantly.")

# -----------------------------
# Inputs
# -----------------------------
col1, col2 = st.columns(2)

with col1:
    title_input = st.text_input(
        "Favorite Game Titles",
        value=st.session_state["title_input"],
        placeholder="Example: Splendor, Azul"
    )
    st.session_state["title_input"] = title_input

with col2:
    category_input = st.text_input(
        "Preferred Categories",
        value=st.session_state["category_input"],
        placeholder="Example: Strategy, Family, Horror"
    )
    st.session_state["category_input"] = category_input

col3, col4 = st.columns(2)

with col3:
    mechanic_input = st.text_input(
        "Preferred Mechanics",
        value=st.session_state["mechanic_input"],
        placeholder="Example: Cooperative Game, Tile Placement"
    )
    st.session_state["mechanic_input"] = mechanic_input

with col4:
    family_input = st.text_input(
        "Preferred Families (optional)",
        value=st.session_state["family_input"],
        placeholder="Example: Family Games"
    )
    st.session_state["family_input"] = family_input

publisher_input = st.text_input(
    "Preferred Publishers (optional)",
    value=st.session_state["publisher_input"],
    placeholder="Example: Asmodee, CMON"
)
st.session_state["publisher_input"] = publisher_input

query_titles = parse_csv_input(title_input)
wanted_categories = parse_csv_input(category_input)
wanted_mechanics = parse_csv_input(mechanic_input)
wanted_families = parse_csv_input(family_input)
wanted_publishers = parse_csv_input(publisher_input)

st.markdown("---")

run_btn = st.button("Get Recommendations", width='stretch')

# -----------------------------
# Run model
# -----------------------------
if run_btn:
    try:
        expanded_categories = wanted_categories
        expanded_mechanics = wanted_mechanics

        if mode == "Title-Based":
            if len(query_titles) == 0:
                st.warning("Please enter at least one game title.")
            else:
                results = engine.discover(
                    query_titles=query_titles,
                    difficulty_label=difficulty_label,
                    top_n=top_n
                )
                formatted = engine.format_results(results)

        elif mode == "Trait-Based":
            if len(wanted_categories) == 0 and len(wanted_mechanics) == 0 and len(wanted_families) == 0 and len(wanted_publishers) == 0:
                st.warning("Please enter at least one trait, category, mechanic, family, or publisher.")
            else:
                expanded_categories, expanded_mechanics = engine.expand_traits(
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics
                )

                results = engine.discover(
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics,
                    wanted_families=wanted_families,
                    wanted_publishers=wanted_publishers,
                    difficulty_label=difficulty_label,
                    top_n=top_n
                )
                formatted = engine.format_results(results)

        else:  # Combined
            if len(query_titles) == 0 and len(wanted_categories) == 0 and len(wanted_mechanics) == 0 and len(wanted_families) == 0 and len(wanted_publishers) == 0:
                st.warning("Please enter at least one title or one trait.")
            else:
                expanded_categories, expanded_mechanics = engine.expand_traits(
                    wanted_categories=wanted_categories,
                    wanted_mechanics=wanted_mechanics
                )

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

        if "formatted" in locals() and len(formatted) > 0:
            st.markdown("---")
            st.markdown('<div class="section-title">🔍 System Interpretation</div>', unsafe_allow_html=True)

            int_col1, int_col2 = st.columns(2)
            with int_col1:
                st.markdown(
                    f'<div class="info-box"><b>Input Titles:</b><br>{", ".join(query_titles) if query_titles else "-"}</div>',
                    unsafe_allow_html=True
                )
            with int_col2:
                st.markdown(
                    f'<div class="info-box"><b>Difficulty Filter:</b><br>{difficulty_label if difficulty_label else "Any"}</div>',
                    unsafe_allow_html=True
                )

            int_col3, int_col4 = st.columns(2)
            with int_col3:
                st.markdown(
                    f'<div class="info-box"><b>Expanded Categories:</b><br>{", ".join(expanded_categories) if expanded_categories else "-"}</div>',
                    unsafe_allow_html=True
                )
            with int_col4:
                st.markdown(
                    f'<div class="info-box"><b>Expanded Mechanics:</b><br>{", ".join(expanded_mechanics) if expanded_mechanics else "-"}</div>',
                    unsafe_allow_html=True
                )

            st.markdown("---")
            st.markdown('<div class="section-title">📊 Recommendation Table</div>', unsafe_allow_html=True)
            st.dataframe(formatted, width='stretch')

            st.markdown("---")
            st.markdown('<div class="section-title">🎯 Recommendations</div>', unsafe_allow_html=True)

            for _, row in formatted.head(5).iterrows():
                st.markdown('<div class="result-card">', unsafe_allow_html=True)
                st.markdown(f'<div class="card-title">🎲 {row.get("name", "-")}</div>', unsafe_allow_html=True)

                metric_col1, metric_col2, metric_col3 = st.columns(3)
                with metric_col1:
                    st.metric("Final Score", row.get("final_score", "-"))
                with metric_col2:
                    st.metric("Rating", row.get("avg_rating", "-"))
                with metric_col3:
                    st.metric("Votes", row.get("num_votes", "-"))

                st.markdown(
                    f'<div class="card-reason"><b>Reason:</b> {shorten_reason(row.get("reason", "-"))}</div>',
                    unsafe_allow_html=True
                )
                st.markdown('</div>', unsafe_allow_html=True)

        elif "formatted" in locals() and len(formatted) == 0:
            st.info("No results found for the given inputs.")

    except Exception as e:
        st.error(f"An error occurred: {e}")

# -----------------------------
# Footer
# -----------------------------
st.markdown("---")
st.caption("Built with Streamlit for the BoardGames_Analyzer project.")