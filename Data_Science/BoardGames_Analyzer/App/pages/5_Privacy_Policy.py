import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
import theme

st.set_page_config(
    page_title="Privacy Policy — Board Game Discovery Engine",
    page_icon="🔒",
    layout="wide",
)
theme.set_meta_description(
    "Privacy policy for BoardGames Analyzer: what information is, and isn't, collected when "
    "you use this board game recommendation demo."
)

st.sidebar.title("⚙ Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)
st.sidebar.markdown("---")
st.sidebar.caption("Board Game Discovery Engine — interactive recommendation demo.")

st.markdown('<div class="main-title"><span class="title-icon">🔒</span> Privacy Policy</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">What information is — and isn\'t — collected when you use BoardGames Analyzer.</div>',
    unsafe_allow_html=True,
)
st.caption("Last updated: September 21, 2026")
st.markdown("---")

sections = [
    (
        "1. Overview",
        "BoardGames Analyzer does not require account creation, sign-up, or login. This policy "
        "explains what information is — and isn't — collected when you use the app.",
    ),
    (
        "2. Information We Do Not Collect",
        "This app does not ask for or store your name, email address, payment information, or any "
        "other personally identifiable information. Game titles, traits, and filters you type into "
        "the Recommendation page are processed only within your active browser session (via "
        "Streamlit's session state) to generate results — they are not saved to a database, logged "
        "permanently, or shared with third parties by this app's own code.",
    ),
    (
        "3. Hosting &amp; Standard Technical Logs",
        "This app is deployed on Streamlit Community Cloud, with source code hosted on GitHub. Like "
        "most web hosting providers, these platforms may automatically collect standard technical "
        "information (such as IP address, browser type, and request timestamps) as part of normal "
        "server operation, governed by their own privacy policies. This project does not have "
        "separate access to, or control over, those platform-level logs.",
    ),
    (
        "4. Cookies &amp; Tracking",
        "This project's own code does not set any advertising, tracking, or analytics cookies. "
        "Streamlit's underlying framework may use minimal technical identifiers necessary to "
        "maintain your browser session while the app is open; these are not used to track you "
        "across other sites.",
    ),
    (
        "5. Third-Party Data (BoardGameGeek)",
        "The board game metadata, ratings, and review text used to power recommendations come from "
        "publicly available BoardGameGeek (BGG) datasets. This app does not collect or process "
        "personal data belonging to BGG users.",
    ),
    (
        "6. Children's Privacy",
        "This app is not directed at children under 13 and does not knowingly collect information "
        "from them.",
    ),
    (
        "7. Changes to This Policy",
        "This policy may be updated as the project evolves. Check back here for the latest version.",
    ),
    (
        "8. Contact",
        "Questions about this policy can be raised via the project's GitHub repository: "
        '<a href="https://github.com/FullyMed/My_Projects" target="_blank">github.com/FullyMed/My_Projects</a>.',
    ),
]

for title, body in sections:
    st.markdown(f'<div class="section-title">{title}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="info-box">{body}</div>', unsafe_allow_html=True)

st.markdown("---")
c1, c2 = st.columns(2)
with c1:
    st.page_link("app.py", label="Home", icon="🏠")
with c2:
    st.page_link("pages/4_Terms_of_Use.py", label="Terms of Use", icon="📜")

st.markdown("---")
st.caption("BoardGames Analyzer — Explainable Hybrid Recommendation System · Built with Streamlit")
