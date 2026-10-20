import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
import theme

st.set_page_config(
    page_title="Privacy policy · Board Game Discovery Engine",
    page_icon="🔒",
    layout="wide",
)
theme.set_meta_description(
    "What BoardGames Analyzer does and doesn't collect when you use it. Short answer: "
    "no accounts, and nothing you type gets saved."
)

st.sidebar.title("Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)
st.sidebar.markdown("---")
st.sidebar.caption("Board Game Discovery Engine, a student research project.")

st.markdown('<div class="main-title">Privacy policy</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">What BoardGames Analyzer does and doesn\'t collect when you use it.</div>',
    unsafe_allow_html=True,
)
st.caption("Last updated: October 15, 2026")
st.markdown("---")

sections = [
    (
        "1. The short version",
        "You don't need an account to use BoardGames Analyzer, and you never sign up or log in. "
        "This page explains what the app does and doesn't collect.",
    ),
    (
        "2. What the app doesn't collect",
        "The app never asks for your name, email address, payment details, or anything else that "
        "identifies you. The game titles, traits and filters you type on the Recommendation page stay "
        "in your current browser session (Streamlit's session state) just long enough to build your "
        "results. The app's own code doesn't save them to a database, keep them in permanent logs, or "
        "share them with anyone.",
    ),
    (
        "3. Hosting and server logs",
        "Streamlit Community Cloud hosts the app, and the source code lives on GitHub. Like most web "
        "hosts, these platforms may record standard technical details such as your IP address, browser "
        "type and request times while running their servers. Their own privacy policies cover those "
        "logs. This project can't see or control them.",
    ),
    (
        "4. Cookies and tracking",
        "The app's own code sets no advertising, tracking or analytics cookies. Streamlit itself may "
        "use small technical identifiers to keep your session alive while the app is open. Nothing "
        "uses them to follow you around other sites.",
    ),
    (
        "5. BoardGameGeek data",
        "The game details, ratings and review text behind the recommendations come from publicly "
        "available BoardGameGeek (BGG) datasets. The app doesn't collect or process personal data "
        "about BGG users.",
    ),
    (
        "6. Children",
        "The app isn't aimed at children under 13, and it doesn't knowingly collect information "
        "from them.",
    ),
    (
        "7. Changes to this policy",
        "The maintainer may update this policy as the project changes. Check this page for the "
        "latest version.",
    ),
    (
        "8. Contact",
        "Questions about privacy? Ask on the project's GitHub repository: "
        '<a href="https://github.com/FullyMed/My_Projects" target="_blank">github.com/FullyMed/My_Projects</a>.',
    ),
]

for title, body in sections:
    st.markdown(f'<div class="section-title">{title}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="info-box">{body}</div>', unsafe_allow_html=True)

st.markdown("---")
c1, c2 = st.columns(2)
with c1:
    st.page_link("app.py", label="Home", icon=":material/home:")
with c2:
    st.page_link("pages/4_Terms_of_Use.py", label="Terms of use", icon=":material/description:")

st.markdown("---")
st.caption("BoardGames Analyzer · board game recommendations with reasons · built with Streamlit")
