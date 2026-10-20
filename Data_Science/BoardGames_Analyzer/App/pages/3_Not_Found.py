import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
import theme

st.set_page_config(
    page_title="Page not found · Board Game Discovery Engine",
    page_icon="🧭",
    layout="wide",
)
theme.set_meta_description(
    "We couldn't find that page. Head back to the BoardGames Analyzer home page, "
    "or go straight to recommendations or the data charts."
)

st.sidebar.title("Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)
st.sidebar.markdown("---")
st.sidebar.caption("Board Game Discovery Engine, a student research project.")

st.markdown('<div class="main-title">404: page not found</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">We couldn\'t find what you were looking for.</div>',
    unsafe_allow_html=True,
)
st.markdown("---")

# Optional ?reason=... query param lets internal links explain what went missing
reason = st.query_params.get("reason", "").strip()[:200]  # rendered escaped by render_not_found
message = reason if reason else "The link may be wrong, or the page moved. Try one of these instead."

theme.render_not_found(
    title="Nothing here",
    message=message,
    icon="compass",
    show_links=True,
)

st.markdown("---")
st.caption("BoardGames Analyzer · board game recommendations with reasons · built with Streamlit")
