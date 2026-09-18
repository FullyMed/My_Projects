import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
import theme

st.set_page_config(
    page_title="Not Found — Board Game Discovery Engine",
    page_icon="🧭",
    layout="wide",
)

st.sidebar.title("⚙ Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)
st.sidebar.markdown("---")
st.sidebar.caption("Board Game Discovery Engine — interactive recommendation demo.")

st.markdown('<div class="main-title"><span class="title-icon">🧭</span> 404 — Not Found</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">The page or content you were looking for doesn\'t exist.</div>',
    unsafe_allow_html=True,
)
st.markdown("---")

# Optional ?reason=... query param lets internal links explain what went missing
reason = st.query_params.get("reason", "").strip()
message = reason if reason else "It may have been moved, renamed, or never existed. Use the links below to keep exploring."

theme.render_not_found(
    title="Nothing here",
    message=message,
    icon="🧭",
    show_links=True,
)

st.markdown("---")
st.caption("BoardGames Analyzer — Explainable Hybrid Recommendation System · Built with Streamlit")
