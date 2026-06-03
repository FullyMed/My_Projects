import streamlit as st

# ─────────────────────────────────────────────────────────────────────────────
# Shared responsive CSS — injected once per page render.
# Layout breakpoints:
#   Mobile  : ≤ 640 px   (iPhone, Android phones)
#   Tablet  : 641–1024 px (iPad, small laptops)
#   Desktop : ≥ 1025 px  (laptop, desktop monitor)
# ─────────────────────────────────────────────────────────────────────────────

_BASE_CSS = """
<style>
/* ── Prevent horizontal overflow on any device ── */
html, body, [data-testid="stAppViewContainer"] {
    overflow-x: hidden !important;
    max-width: 100vw !important;
}

/* ── Tighten main-area padding so mobile gets more usable space ── */
.block-container {
    padding: 2rem 1.5rem 4rem !important;
    max-width: 100% !important;
}

/* ── Ensure all images / pyplot figures scale responsively ── */
img, [data-testid="stImage"] img,
.stPlotlyChart, [data-testid="stArrowVegaLiteChart"] {
    max-width: 100% !important;
    height: auto !important;
}

/* ── Dataframe never bleeds past its container ── */
[data-testid="stDataFrame"], iframe {
    max-width: 100% !important;
    overflow-x: auto !important;
}

/* ── Streamlit metric ── */
[data-testid="stMetricValue"] {
    font-size: clamp(1rem, 3.5vw, 1.5rem) !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
[data-testid="stMetricLabel"] {
    font-size: clamp(0.7rem, 2vw, 0.875rem) !important;
}

/* ── Buttons: Apple-recommended 44 px minimum tap target ── */
.stButton > button {
    min-height: 44px !important;
    width: 100% !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    touch-action: manipulation !important;
}

/* ── Inputs: ≥ 16 px prevents iOS auto-zoom on focus ── */
input, textarea, select,
div[data-baseweb="input"] input,
div[data-baseweb="textarea"] textarea {
    font-size: 16px !important;
    min-height: 44px !important;
}
div[data-baseweb="input"] > div,
div[data-baseweb="select"] > div {
    min-height: 44px !important;
    border-radius: 12px !important;
}

/* ══════════════════════════════════════════════════════════════════
   TABLET  641 px – 1024 px  (iPad portrait/landscape, small laptop)
   ══════════════════════════════════════════════════════════════════ */
@media screen and (max-width: 1024px) {
    .main-title   { font-size: 2.2rem !important; }
    .subtitle     { font-size: 1.05rem !important; }
    .section-title { font-size: 1.05rem !important; }

    .home-card  { padding: 18px !important; border-radius: 14px !important; }
    .home-card-icon  { font-size: 2rem !important; }
    .home-card-title { font-size: 1.1rem !important; }
    .home-card-desc  { font-size: 0.9rem !important; }

    .stat-box    { padding: 14px !important; }
    .stat-number { font-size: 1.5rem !important; line-height: 1.2 !important; }
    .stat-label  { font-size: 0.82rem !important; }

    .info-box   { padding: 12px 14px !important; font-size: 0.95rem !important; }
    .result-card { padding: 16px !important; }
    .card-title  { font-size: 1.2rem !important; }
    .card-reason { font-size: 0.92rem !important; }
}

/* ══════════════════════════════════════════════════════════════════
   MOBILE  ≤ 640 px  (iPhone SE → iPhone Pro Max, Android phones)
   ══════════════════════════════════════════════════════════════════ */
@media screen and (max-width: 640px) {
    /* Stack ALL Streamlit columns vertically */
    [data-testid="stHorizontalBlock"] {
        flex-wrap: wrap !important;
        gap: 0.5rem !important;
    }
    [data-testid="column"] {
        width: 100% !important;
        min-width: 100% !important;
        flex: 0 0 100% !important;
    }

    /* Reduce main area padding */
    .block-container {
        padding: 1rem 0.75rem 3rem !important;
    }

    /* Sidebar padding */
    [data-testid="stSidebar"] > div:first-child {
        padding: 1rem 0.75rem !important;
    }

    /* Typography */
    .main-title    { font-size: 1.75rem !important; line-height: 1.2 !important; }
    .subtitle      { font-size: 0.92rem !important; }
    .section-title { font-size: 0.95rem !important; margin-top: 0.6rem !important; }

    /* Cards */
    .info-box {
        padding: 10px 12px !important;
        font-size: 0.88rem !important;
        border-radius: 10px !important;
        margin-bottom: 10px !important;
    }
    .result-card {
        padding: 14px !important;
        border-radius: 14px !important;
        margin-bottom: 12px !important;
    }
    .card-title  { font-size: 1.05rem !important; }
    .card-reason { font-size: 0.87rem !important; }

    /* Home page cards */
    .home-card {
        padding: 16px !important;
        border-radius: 12px !important;
        margin-bottom: 12px !important;
    }
    .home-card-icon  { font-size: 1.8rem !important; }
    .home-card-title { font-size: 1rem !important; }
    .home-card-desc  { font-size: 0.85rem !important; }

    /* Stat boxes */
    .stat-box    { padding: 12px 8px !important; border-radius: 10px !important; }
    .stat-number { font-size: 1.35rem !important; line-height: 1.2 !important; }
    .stat-label  { font-size: 0.75rem !important; }

    /* Button */
    .stButton > button {
        height: auto !important;
        padding: 0.7rem 1rem !important;
        font-size: 0.95rem !important;
    }
}

/* ══════════════════════════════════════════════════════════════════
   SMALL MOBILE  ≤ 390 px  (iPhone SE, older Androids)
   ══════════════════════════════════════════════════════════════════ */
@media screen and (max-width: 390px) {
    .main-title  { font-size: 1.5rem !important; }
    .stat-number { font-size: 1.2rem !important; line-height: 1.2 !important; }
    .result-card { padding: 11px !important; }
    .section-title { padding-left: 8px !important; border-left-width: 3px !important; }
}
</style>
"""

# ─────────────────────────────────────────────────────────────────────────────
# Theme-specific CSS (colours, backgrounds, borders)
# ─────────────────────────────────────────────────────────────────────────────

_DARK_CSS = """
<style>
.stApp { background: linear-gradient(180deg, #0f172a 0%, #020617 100%); color: #f8fafc; }
[data-testid="stSidebar"] { background: rgba(15,23,42,0.96); border-right: 1px solid rgba(148,163,184,0.15); }

/* ── Header / top toolbar ── */
[data-testid="stHeader"] {
    background: rgba(15,23,42,0.96) !important;
    border-bottom: 1px solid rgba(148,163,184,0.15) !important;
    backdrop-filter: blur(8px) !important;
}
[data-testid="stHeader"] button svg { fill: #94a3b8 !important; }
[data-testid="stHeader"] button:hover svg { fill: #f8fafc !important; }
[data-testid="stDecoration"] {
    background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%) !important;
    height: 3px !important;
}

/* ── Sidebar nav links (multi-page) ── */
[data-testid="stSidebarNav"] a span { color: #94a3b8 !important; }
[data-testid="stSidebarNav"] a:hover { background: rgba(148,163,184,0.08) !important; }
[data-testid="stSidebarNav"] a:hover span { color: #f8fafc !important; }
[data-testid="stSidebarNav"] [aria-selected="true"],
[data-testid="stSidebarNav"] [aria-current="page"] {
    background: rgba(99,102,241,0.20) !important;
}
[data-testid="stSidebarNav"] [aria-selected="true"] span,
[data-testid="stSidebarNav"] [aria-current="page"] span { color: #a5b4fc !important; }

/* ── Radio buttons (sidebar + main area) ── */
[data-testid="stSidebar"] [data-testid="stRadio"] label,
[data-testid="stSidebar"] [data-testid="stRadio"] label p { color: #cbd5e1 !important; }
[role="radiogroup"] [role="radio"] > div { border-color: #6366f1 !important; }
[role="radiogroup"] [role="radio"][aria-checked="true"] > div {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}
[role="radiogroup"] [role="radio"][aria-checked="true"] > div > div {
    background-color: #6366f1 !important;
}

/* ── Slider (sidebar + main area) ── */
[role="slider"] {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}
[data-baseweb="slider"] > div > div:nth-child(2) { background: #6366f1 !important; }
[data-testid="stSliderTrackFill"],
[data-testid="stSlider"] [data-baseweb="slider"] [data-testid="stSliderTrackFill"] { background: #6366f1 !important; }

.main-title    { font-size: 3rem; font-weight: 800; color: #f8fafc; margin-bottom: 0.25rem; }
.subtitle      { font-size: 1.15rem; color: #cbd5e1; margin-bottom: 1.2rem; }
.section-title { font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-top: 0.8rem; margin-bottom: 0.6rem; }

.info-box {
    background: rgba(30,41,59,0.88);
    border: 1px solid rgba(148,163,184,0.22);
    border-radius: 14px; padding: 14px 16px;
    color: #e2e8f0; margin-bottom: 14px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.18);
}
.result-card {
    background: rgba(15,23,42,0.96);
    border: 1px solid rgba(148,163,184,0.18);
    border-radius: 18px; padding: 18px; margin-bottom: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.28);
}
.card-title  { font-size: 1.35rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.35rem; }
.card-reason { color: #cbd5e1; font-size: 0.98rem; line-height: 1.5; margin-top: 0.5rem; }

.home-card {
    background: rgba(30,41,59,0.88);
    border: 1px solid rgba(148,163,184,0.22);
    border-radius: 18px; padding: 24px; margin-bottom: 16px; text-align: center;
}
.home-card-icon  { font-size: 2.5rem; margin-bottom: 0.5rem; }
.home-card-title { font-size: 1.2rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.4rem; }
.home-card-desc  { color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; }

.stat-box    { background: rgba(30,41,59,0.88); border: 1px solid rgba(148,163,184,0.18); border-radius: 12px; padding: 16px; text-align: center; }
.stat-number { font-size: 1.8rem; font-weight: 800; color: #6366f1; }
.stat-label  { font-size: 0.85rem; color: #94a3b8; margin-top: 0.2rem; }

div[data-baseweb="input"] > div,
div[data-baseweb="select"] > div { background-color: rgba(51,65,85,0.92) !important; color: #f8fafc !important; border: 1px solid rgba(148,163,184,0.25) !important; }
input, textarea { color: #f8fafc !important; }

.stButton > button { border: 1px solid rgba(148,163,184,0.18); background: linear-gradient(90deg,#2563eb,#7c3aed); color: white; }
.stButton > button:hover { color: white; border: 1px solid rgba(148,163,184,0.35); }
hr { border: none; border-top: 1px solid rgba(148,163,184,0.18); margin: 1.2rem 0; }
</style>
"""

_LIGHT_CSS = """
<style>
/* ── Page: soft indigo-lavender gradient so white cards stand out ── */
.stApp {
    background: linear-gradient(160deg, #eef2ff 0%, #f5f0ff 45%, #fdf4ff 100%);
    color: #1e293b;
}

/* ── Sidebar: pure white + subtle indigo shadow ── */
[data-testid="stSidebar"] {
    background: #ffffff;
    border-right: 1.5px solid #e0e7ff;
    box-shadow: 2px 0 16px rgba(99,102,241,0.07);
}

/* ── Title: gradient text (indigo → violet) ── */
.main-title {
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(135deg, #4338ca 0%, #7c3aed 60%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.25rem;
    line-height: 1.15;
}
/* Emoji in the title must escape the transparent fill so it renders normally */
.main-title .title-icon {
    -webkit-text-fill-color: initial !important;
    background: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
}

.subtitle {
    font-size: 1.15rem;
    color: #64748b;
    margin-bottom: 1.2rem;
}

/* ── Section titles: indigo left-border accent ── */
.section-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #1e293b;
    margin-top: 0.8rem;
    margin-bottom: 0.6rem;
    padding-left: 10px;
    border-left: 3px solid #6366f1;
}

/* ── Info boxes: tinted indigo so they're visible against the page ── */
.info-box {
    background: rgba(238,242,255,0.85);
    border: 1px solid #c7d2fe;
    border-radius: 14px;
    padding: 14px 16px;
    color: #1e293b;
    margin-bottom: 14px;
    box-shadow: 0 2px 8px rgba(99,102,241,0.09);
}

/* ── Result cards: white + colored left stripe ── */
.result-card {
    background: #ffffff;
    border: 1px solid #e0e7ff;
    border-left: 4px solid #6366f1;
    border-radius: 18px;
    padding: 18px;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(99,102,241,0.09), 0 1px 3px rgba(0,0,0,0.04);
}

.card-title  { font-size: 1.35rem; font-weight: 700; color: #1e293b; margin-bottom: 0.35rem; }
.card-reason { color: #475569; font-size: 0.98rem; line-height: 1.5; margin-top: 0.5rem; }

/* ── Home page nav cards ── */
.home-card {
    background: #ffffff;
    border: 1px solid #e0e7ff;
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 16px;
    text-align: center;
    box-shadow: 0 4px 16px rgba(99,102,241,0.09);
}
.home-card-icon  { font-size: 2.5rem; margin-bottom: 0.5rem; }
.home-card-title { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.4rem; }
.home-card-desc  { color: #64748b; font-size: 0.95rem; line-height: 1.5; }

/* ── Stat boxes: gradient number text ── */
.stat-box {
    background: #ffffff;
    border: 1px solid #e0e7ff;
    border-radius: 14px;
    padding: 20px 16px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(99,102,241,0.08);
}
.stat-number {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #4338ca, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
}
.stat-label { font-size: 0.85rem; color: #64748b; margin-top: 0.3rem; font-weight: 500; }

/* ── Metric widget ── */
[data-testid="stMetricValue"] > div { color: #4338ca !important; font-weight: 700 !important; }
[data-testid="stMetricLabel"],
[data-testid="stMetricLabel"] p,
[data-testid="stMetricLabel"] span,
[data-testid="stMetricLabel"] div { color: #64748b !important; }
[data-testid="stMetricDelta"] { color: #475569 !important; }

/* ── Widget labels (main content area) ── */
[data-testid="stWidgetLabel"] p,
[data-testid="stWidgetLabel"] span,
[data-testid="stWidgetLabel"] label,
[data-testid="stTextInputRootElement"] label,
[data-testid="stTextInputRootElement"] p,
[data-baseweb="form-control-label"] span,
[data-baseweb="form-control-label"],
.stTextInput label, .stSelectbox label,
.stSlider label, .stMultiSelect label,
.stTextInput p, .stSelectbox p,
.stSlider p, .stMultiSelect p { color: #1e293b !important; }

/* ── Caption text (e.g. below Try Example button) ── */
[data-testid="stCaptionContainer"] p,
[data-testid="stCaptionContainer"] span { color: #64748b !important; }

/* ── Inputs: indigo-tinted border ── */
div[data-baseweb="input"] > div,
div[data-baseweb="select"] > div {
    background-color: #ffffff !important;
    color: #1e293b !important;
    border: 1.5px solid #c7d2fe !important;
}
input, textarea { color: #1e293b !important; }

/* ── Placeholder text ── */
input::placeholder,
textarea::placeholder,
[data-baseweb="input"] input::placeholder,
[data-baseweb="textarea"] textarea::placeholder {
    color: #94a3b8 !important;
    opacity: 1 !important;
}

/* ── Selectbox: value text + dropdown arrow ── */
[data-baseweb="select"] span { color: #1e293b !important; }
[data-baseweb="select"] svg,
[data-testid="stSelectbox"] svg { fill: #4338ca !important; }

/* ── Slider — single and range, track fill + thumbs ── */
/* Thumb circle */
[data-testid="stSlider"] [role="slider"] {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}
/* Active track fill */
[data-testid="stSlider"] [data-baseweb="slider"] > div > div:nth-child(2) {
    background: #6366f1 !important;
}
[data-testid="stSlider"] [data-baseweb="slider"] [data-testid="stSliderTrackFill"] {
    background: #6366f1 !important;
}

/* ── Radio buttons (main content area + sidebar) ── */
[role="radiogroup"] [role="radio"] > div { border-color: #6366f1 !important; }
[role="radiogroup"] [role="radio"][aria-checked="true"] > div {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}
[role="radiogroup"] [role="radio"][aria-checked="true"] > div > div {
    background-color: #6366f1 !important;
}
[role="radiogroup"] label p,
[role="radiogroup"] label span { color: #1e293b !important; }

/* ── Button: clean gradient, shadow-only (no visible border) ── */
.stButton > button {
    border: none !important;
    background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
    letter-spacing: 0.01em;
}
.stButton > button:hover {
    color: white;
    box-shadow: 0 6px 20px rgba(99,102,241,0.45);
}

hr { border: none; border-top: 1px solid #e0e7ff; margin: 1.2rem 0; }

/* ── Header / top toolbar ── */
[data-testid="stHeader"] {
    background: rgba(238,242,255,0.95) !important;
    border-bottom: 1.5px solid #e0e7ff !important;
    backdrop-filter: blur(8px) !important;
}
[data-testid="stHeader"] button svg { fill: #4338ca !important; }
[data-testid="stHeader"] button:hover svg { fill: #7c3aed !important; }
/* "Deploy" text button */
[data-testid="stHeader"] [data-testid="stDeployButton"],
[data-testid="stHeader"] button[kind="header"] { color: #4338ca !important; }

/* ── Colored decoration stripe at the very top ── */
[data-testid="stDecoration"] {
    background: linear-gradient(90deg, #4338ca 0%, #7c3aed 55%, #a855f7 100%) !important;
    height: 3px !important;
}

/* ── Sidebar nav links (multi-page) ── */
[data-testid="stSidebarNav"] a span { color: #475569 !important; }
[data-testid="stSidebarNav"] a:hover {
    background: rgba(99,102,241,0.08) !important;
}
[data-testid="stSidebarNav"] a:hover span { color: #4338ca !important; }
[data-testid="stSidebarNav"] [aria-selected="true"],
[data-testid="stSidebarNav"] [aria-current="page"] {
    background: rgba(99,102,241,0.12) !important;
}
[data-testid="stSidebarNav"] [aria-selected="true"] span,
[data-testid="stSidebarNav"] [aria-current="page"] span {
    color: #4338ca !important;
    font-weight: 600 !important;
}

/* ── Force all sidebar text to be visible on white background ── */
[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] h3,
[data-testid="stSidebar"] p,
[data-testid="stSidebar"] span,
[data-testid="stSidebar"] label,
[data-testid="stSidebar"] div,
[data-testid="stSidebar"] .stMarkdown,
[data-testid="stSidebar"] .stMarkdown p,
[data-testid="stSidebar"] .stMarkdown span,
[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p,
[data-testid="stSidebar"] [data-testid="stWidgetLabel"] p,
[data-testid="stSidebar"] [data-testid="stWidgetLabel"] span,
[data-testid="stSidebar"] [data-testid="stCaptionContainer"] p {
    color: #1e293b !important;
}

/* ── Sidebar info / alert boxes ── */
[data-testid="stSidebar"] [data-testid="stAlertContainer"],
[data-testid="stSidebar"] .stAlert {
    background: rgba(238,242,255,0.85) !important;
    border: 1px solid #c7d2fe !important;
    color: #1e293b !important;
    border-radius: 10px !important;
}
[data-testid="stSidebar"] .stAlert p,
[data-testid="stSidebar"] .stAlert span { color: #1e293b !important; }
[data-testid="stSidebar"] .stAlert svg { fill: #4338ca !important; }

/* ── Radio buttons — multiple selectors to cover Streamlit/BaseWeb variants ── */
[data-testid="stSidebar"] [data-testid="stRadio"] label,
[data-testid="stSidebar"] [data-testid="stRadio"] label p,
[data-testid="stSidebar"] [data-testid="stRadio"] label span { color: #1e293b !important; }

[data-testid="stSidebar"] [role="radiogroup"] [role="radio"] > div { border-color: #6366f1 !important; }
[data-testid="stSidebar"] [role="radiogroup"] [role="radio"] > div > div { border-color: #6366f1 !important; }
[data-testid="stSidebar"] [role="radiogroup"] [role="radio"][aria-checked="true"] > div {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}
[data-testid="stSidebar"] [role="radiogroup"] [role="radio"][aria-checked="true"] > div > div {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}
[data-testid="stSidebar"] [data-baseweb="radio"] [aria-checked="true"] div,
[data-testid="stSidebar"] [data-baseweb="radio"] [aria-checked="true"] > div {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}

/* ── Slider ── */
[data-testid="stSidebar"] [data-baseweb="slider"] div[role="slider"],
[data-testid="stSidebar"] [data-baseweb="slider"] [data-testid="stThumbValue"] {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
    color: #1e293b !important;
}
[data-testid="stSidebar"] [data-baseweb="slider"] div[data-testid="stSliderTrackFill"] {
    background-color: #6366f1 !important;
}
</style>
"""


def sidebar_theme() -> str:
    """Render theme toggle in sidebar; return the selected mode."""
    if "theme" not in st.session_state:
        st.session_state["theme"] = "Light"
    selected = st.sidebar.radio(
        "Theme",
        ["Light", "Dark"],
        index=0 if st.session_state["theme"] == "Light" else 1,
        key="theme_radio",
    )
    st.session_state["theme"] = selected
    return selected


def apply_theme(theme_mode: str):
    """Inject base responsive CSS + theme-specific colour CSS."""
    st.markdown(_BASE_CSS, unsafe_allow_html=True)
    st.markdown(_DARK_CSS if theme_mode == "Dark" else _LIGHT_CSS, unsafe_allow_html=True)


def chart_colors(theme_mode: str) -> dict:
    """Return a matplotlib colour palette for the active theme."""
    if theme_mode == "Dark":
        return {
            "bg": "#1e293b",
            "fig_bg": "#0f172a",
            "text": "#f8fafc",
            "grid": "#334155",
            "primary": "#6366f1",
            "secondary": "#8b5cf6",
            "accent": "#06b6d4",
            "bar_alpha": 0.88,
        }
    return {
        "bg": "#ffffff",
        "fig_bg": "#f0f4ff",   # matches the page tint so charts blend in
        "text": "#1e293b",
        "grid": "#e0e7ff",
        "primary": "#4338ca",  # deeper indigo — more saturated on white
        "secondary": "#7c3aed",
        "accent": "#0284c7",
        "bar_alpha": 0.82,
    }


def style_ax(ax, fig, colors: dict, title: str = ""):
    """Apply consistent theme styling to a matplotlib Axes object."""
    fig.patch.set_facecolor(colors["fig_bg"])
    ax.set_facecolor(colors["bg"])
    ax.tick_params(colors=colors["text"], labelcolor=colors["text"])
    for spine in ax.spines.values():
        spine.set_edgecolor(colors["grid"])
    ax.xaxis.label.set_color(colors["text"])
    ax.yaxis.label.set_color(colors["text"])
    if title:
        ax.set_title(title, color=colors["text"], fontsize=11, fontweight="bold", pad=10)
