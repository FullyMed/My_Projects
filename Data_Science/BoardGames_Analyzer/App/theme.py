import html
import json

import streamlit as st
import streamlit.components.v1 as components

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

/* ── Main column: capped width so lines stay readable on wide monitors ── */
.block-container {
    padding: 2rem 1.5rem 4rem !important;
    max-width: 1180px !important;
    margin: 0 auto !important;
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

/* ── Numbers line up in columns (metrics, stat boxes, the results table) ── */
[data-testid="stMetricValue"], .stat-number, [data-testid="stDataFrame"] {
    font-variant-numeric: tabular-nums;
}

/* ── Headings break into balanced lines; paragraphs avoid one-word last lines ── */
.main-title, .section-title, .card-title, .home-card-title { text-wrap: balance; }
.subtitle, .info-box, .card-reason, .home-card-desc { text-wrap: pretty; }

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
/* Both themes use a gradient button with white text; the label is a markdown <p>,
   so pin it or the themes' general paragraph colour would bleed into it */
.stButton > button [data-testid="stMarkdownContainer"] p { color: #ffffff !important; }

/* Press feedback: a quick 0.97 scale confirms the click (ease-out so it reacts at once) */
.stButton > button {
    transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms ease, border-color 200ms ease;
}
.stButton > button:active { transform: scale(0.97); }

/* "Try an example" sits beside a caption, so it sizes to its label instead of wrapping */
.st-key-try_example button {
    width: auto !important;
    white-space: nowrap;
    padding: 0 1.1rem !important;
}

/* ── Keyboard focus ──
   The themes pin input/select borders with !important, which also hid Streamlit's own
   focus border, so focus gets an explicit ring. --focus-ring is set per theme. */
div[data-baseweb="input"]:focus-within > div,
div[data-baseweb="select"]:focus-within > div,
div[data-baseweb="textarea"]:focus-within > div {
    outline: 2px solid var(--focus-ring, #4338ca) !important;
    outline-offset: 2px;
}
.stButton > button:focus-visible,
[data-testid="stPageLink-NavLink"]:focus-visible,
[data-testid="stSidebarNav"] a:focus-visible,
[data-testid="stMarkdownContainer"] a:focus-visible,
[role="slider"]:focus-visible {
    outline: 2px solid var(--focus-ring, #4338ca) !important;
    outline-offset: 2px;
}
label[data-baseweb="radio"]:has(input:focus-visible) {
    outline: 2px solid var(--focus-ring, #4338ca);
    outline-offset: 2px;
    border-radius: 6px;
}

/* ── Skip link: first thing a keyboard user reaches, hidden until focused ── */
.skip-link {
    position: fixed;
    left: 12px;
    top: -60px;
    z-index: 1000002;
    padding: 10px 16px;
    border-radius: 10px;
    background: #4338ca;
    color: #ffffff !important;
    font-weight: 600;
    text-decoration: none;
    transition: top 160ms cubic-bezier(0.23, 1, 0.32, 1);
}
.skip-link:focus { top: 12px; outline: 2px solid #ffffff; outline-offset: 2px; }

/* ── Touch screens: 44px targets for page links ── */
@media (pointer: coarse) {
    [data-testid="stSidebarNav"] a,
    [data-testid="stPageLink-NavLink"] { min-height: 44px; display: flex; align-items: center; }
}

/* ── Reduced motion: keep colour and shadow changes, drop movement ── */
@media (prefers-reduced-motion: reduce) {
    .stButton > button { transition: box-shadow 200ms ease, border-color 200ms ease; }
    .stButton > button:active { transform: none; }
    .skip-link { transition: none; }
}

/* ── Windows High Contrast: gradient-clipped text would turn invisible ── */
@media (forced-colors: active) {
    .main-title, .stat-number {
        background: none !important;
        -webkit-text-fill-color: CanvasText !important;
        color: CanvasText !important;
    }
}

/* ── Home cards: equal height, with each card's link pinned to the bottom ── */
[data-testid="stHorizontalBlock"]:has([class*="st-key-home_card_"]) { align-items: stretch !important; }
[data-testid="stColumn"]:has([class*="st-key-home_card_"]) > [data-testid="stVerticalBlock"],
[data-testid="stLayoutWrapper"]:has(> [class*="st-key-home_card_"]),
[class*="st-key-home_card_"] { height: 100%; box-sizing: border-box; }
[class*="st-key-home_card_"] > [data-testid="stElementContainer"]:last-child { margin-top: auto; }

/* ── Page links read as links: accent colour, medium weight ── */
[data-testid="stPageLink-NavLink"] p { font-weight: 600; }

/* ── Brand mark (the die beside the Home title) and card icons ── */
.brand-mark { display: inline-block; width: 0.9em; height: 0.9em; vertical-align: -0.08em; margin-right: 0.3em; }
.home-card-icon svg { width: 32px; height: 32px; }

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
/* Streamlit's outer input wrapper keeps its own (OS-driven) background and border behind the
   inner box the themes style, which showed as a dark or light rim; let the inner box draw it all */
div[data-baseweb="input"],
div[data-baseweb="textarea"] {
    background: transparent !important;
    border-color: transparent !important;
    border-radius: 12px !important;
}

/* ══════════════════════════════════════════════════════════════════
   TABLET  641 px – 1024 px  (iPad portrait/landscape, small laptop)
   ══════════════════════════════════════════════════════════════════ */
@media screen and (max-width: 1024px) {
    .main-title   { font-size: 2.2rem !important; }
    .subtitle     { font-size: 1.05rem !important; }
    .section-title { font-size: 1.05rem !important; }

    .home-card, [class*="st-key-home_card_"] { padding: 18px !important; border-radius: 14px !important; }
    .home-card-icon  { font-size: 2rem !important; }
    .home-card-title { font-size: 1.1rem !important; }
    .home-card-desc  { font-size: 0.9rem !important; }

    .stat-box    { padding: 14px !important; }
    .stat-number { font-size: 1.5rem !important; line-height: 1.2 !important; }
    .stat-label  { font-size: 0.82rem !important; }

    .info-box   { padding: 12px 14px !important; font-size: 0.95rem !important; }
    .result-card, [class*="st-key-result_card_"] { padding: 16px !important; }
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
    [data-testid="stColumn"] {
        width: 100% !important;
        min-width: 100% !important;
        flex: 0 0 100% !important;
    }

    /* Reduce main area padding — extra top clears Streamlit's sticky header on mobile */
    .block-container {
        padding: 3.5rem 0.75rem 3rem !important;
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
    .result-card, [class*="st-key-result_card_"] {
        padding: 14px !important;
        border-radius: 14px !important;
        margin-bottom: 12px !important;
    }
    .card-title  { font-size: 1.05rem !important; }
    .card-reason { font-size: 0.87rem !important; }

    /* Home page cards */
    .home-card, [class*="st-key-home_card_"] {
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
    .result-card, [class*="st-key-result_card_"] { padding: 11px !important; }
    .section-title { padding-left: 8px !important; border-left-width: 3px !important; }
}
</style>
"""

# ─────────────────────────────────────────────────────────────────────────────
# Theme-specific CSS (colours, backgrounds, borders)
# ─────────────────────────────────────────────────────────────────────────────

_DARK_CSS = """
<style>
:root { --focus-ring: #a5b4fc; }
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
.result-card, [class*="st-key-result_card_"] {
    background: rgba(15,23,42,0.96);
    border: 1px solid rgba(148,163,184,0.18);
    border-radius: 18px; padding: 18px; margin-bottom: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.28);
}
.card-title  { font-size: 1.35rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.35rem; }
.card-reason { color: #cbd5e1; font-size: 0.98rem; line-height: 1.5; margin-top: 0.5rem; }

.home-card, [class*="st-key-home_card_"] {
    background: rgba(30,41,59,0.88);
    border: 1px solid rgba(148,163,184,0.22);
    border-radius: 18px; padding: 24px; margin-bottom: 16px;
}
.home-card-icon  { color: #a5b4fc; margin-bottom: 0.5rem; }
.brand-mark { color: #a5b4fc; }
/* Spinners: Streamlit paints them over a gradient in its own (OS-driven) base colour,
   which put dark text on a near-black box in the mismatched combination */
[data-testid="stSpinner"] { background: transparent !important; }
[data-testid="stSpinner"] p, [data-testid="stSpinner"] div { color: #e2e8f0 !important; }
[data-testid="stPageLink-NavLink"] [data-testid="stIconMaterial"],
[data-testid="stPageLink-NavLink"] p { color: #a5b4fc !important; }
.home-card-title { font-size: 1.2rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.4rem; }
.home-card-desc  { color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; }

.stat-box    { background: rgba(30,41,59,0.88); border: 1px solid rgba(148,163,184,0.18); border-radius: 12px; padding: 16px; text-align: center; }
.stat-number { font-size: 1.8rem; font-weight: 800; color: #6366f1; }
.stat-label  { font-size: 0.85rem; color: #94a3b8; margin-top: 0.2rem; }

div[data-baseweb="input"] > div,
div[data-baseweb="select"] > div { background-color: rgba(51,65,85,0.92) !important; color: #f8fafc !important; border: 1px solid rgba(148,163,184,0.25) !important; }
input, textarea { color: #f8fafc !important; }

.stButton > button { border: 1px solid rgba(148,163,184,0.18); background: linear-gradient(90deg,#2563eb,#7c3aed); color: white; }
@media (hover: hover) and (pointer: fine) {
    .stButton > button:hover { color: white; border: 1px solid rgba(148,163,184,0.45); box-shadow: 0 6px 18px rgba(37,99,235,0.28); }
}
input::placeholder, textarea::placeholder { color: #aab4c3 !important; opacity: 1 !important; }
hr { border: none; border-top: 1px solid rgba(148,163,184,0.18); margin: 1.2rem 0; }

/* ── Text Streamlit colours from its own light/dark base ──
   That base follows the OS, not this toggle, so with an OS in light mode these came out
   as dark grey on navy. Pin them the same way _LIGHT_CSS does for its palette. ── */
[data-testid="stWidgetLabel"] p,
[data-testid="stWidgetLabel"] span,
[data-testid="stWidgetLabel"] label,
[data-baseweb="form-control-label"] { color: #cbd5e1 !important; }
[data-testid="stCaptionContainer"] p,
[data-testid="stCaptionContainer"] span { color: #94a3b8 !important; }
[data-testid="stSliderTickBar"],
[data-testid="stSliderTickBar"] * { color: #94a3b8 !important; }
[data-testid="stMetricValue"],
[data-testid="stMetricValue"] > div { color: #a5b4fc !important; font-weight: 700 !important; }
[data-testid="stMetricLabel"],
[data-testid="stMetricLabel"] p,
[data-testid="stMetricLabel"] span,
[data-testid="stMetricLabel"] div { color: #94a3b8 !important; }
[data-testid="stMainBlockContainer"] [data-testid="stMarkdownContainer"] p,
[data-testid="stMainBlockContainer"] [data-testid="stMarkdownContainer"] li { color: #e2e8f0; }
[data-testid="stMarkdownContainer"] a { color: #a5b4fc !important; }
[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] h3 { color: #f8fafc !important; }
[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p { color: #cbd5e1 !important; }
[data-testid="stSidebar"] [data-testid="stIconMaterial"],
[data-testid="stExpandSidebarButton"] [data-testid="stIconMaterial"] { color: #94a3b8 !important; }
[data-testid="stTooltipHoverTarget"] svg, [data-testid="stTooltipIcon"] svg { color: #94a3b8 !important; }  /* help= "?" icons */
input, textarea { color: #f8fafc !important; }
[data-baseweb="select"] span { color: #f8fafc !important; }
[data-baseweb="select"] svg, [data-testid="stSelectbox"] svg { fill: #cbd5e1 !important; }  /* dropdown chevrons */
hr { border: none; border-top: 1px solid rgba(148,163,184,0.2); }

/* ── Alerts (dark) ──
   Streamlit colours st.warning/info/error/success from its own light/dark base,
   which follows the OS, not this toggle, so pin them to readable colours here ── */
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) { background-color: rgba(250,204,21,0.12) !important; border: 1px solid rgba(250,204,21,0.35) !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) p, [data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) li, [data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) span { color: #fde68a !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) svg { fill: #fde68a !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) { background-color: rgba(99,102,241,0.16) !important; border: 1px solid rgba(129,140,248,0.35) !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) p, [data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) li, [data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) span { color: #c7d2fe !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) svg { fill: #c7d2fe !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) { background-color: rgba(239,68,68,0.14) !important; border: 1px solid rgba(248,113,113,0.35) !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) p, [data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) li, [data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) span { color: #fecaca !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) svg { fill: #fecaca !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) { background-color: rgba(34,197,94,0.14) !important; border: 1px solid rgba(74,222,128,0.35) !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) p, [data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) li, [data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) span { color: #bbf7d0 !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) svg { fill: #bbf7d0 !important; }
</style>
"""

_LIGHT_CSS = """
<style>
:root { --focus-ring: #4338ca; }

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
/* The brand mark must escape the transparent gradient fill so it renders normally */
.main-title .brand-mark {
    -webkit-text-fill-color: initial !important;
    background: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
}

.subtitle {
    font-size: 1.15rem;
    color: #475569;
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
.result-card, [class*="st-key-result_card_"] {
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
.home-card, [class*="st-key-home_card_"] {
    background: #ffffff;
    border: 1px solid #e0e7ff;
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(99,102,241,0.09);
}
.home-card-icon  { color: #4338ca; margin-bottom: 0.5rem; }
.home-card-title { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.4rem; }
.home-card-desc  { color: #475569; font-size: 0.95rem; line-height: 1.5; }
.brand-mark { color: #4338ca; }
/* Spinners: Streamlit paints them over a gradient in its own (OS-driven) base colour,
   which put dark text on a near-black box in the mismatched combination */
[data-testid="stSpinner"] { background: transparent !important; }
[data-testid="stSpinner"] p, [data-testid="stSpinner"] div { color: #1e293b !important; }
[data-testid="stPageLink-NavLink"] [data-testid="stIconMaterial"],
[data-testid="stPageLink-NavLink"] p { color: #4338ca !important; }

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
.stat-label { font-size: 0.85rem; color: #475569; margin-top: 0.3rem; font-weight: 500; }

/* ── Metric widget ── */
[data-testid="stMetricValue"] > div { color: #4338ca !important; font-weight: 700 !important; }
[data-testid="stMetricLabel"],
[data-testid="stMetricLabel"] p,
[data-testid="stMetricLabel"] span,
[data-testid="stMetricLabel"] div { color: #475569 !important; }
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
[data-testid="stCaptionContainer"] span { color: #475569 !important; }

/* ── Text Streamlit colours from its own (OS-driven) base theme ──
   With an OS in dark mode these would otherwise come out light-on-light ── */
[data-testid="stMarkdownContainer"] a { color: #4338ca !important; }
[data-testid="stMainBlockContainer"] [data-testid="stMarkdownContainer"] p,
[data-testid="stMainBlockContainer"] [data-testid="stMarkdownContainer"] li { color: #1e293b; }
[data-testid="stSliderTickBar"],
[data-testid="stSliderTickBar"] * { color: #475569 !important; }
[data-testid="stSidebar"] [data-testid="stIconMaterial"],
[data-testid="stExpandSidebarButton"] [data-testid="stIconMaterial"] { color: #64748b !important; }
[data-testid="stTooltipHoverTarget"] svg, [data-testid="stTooltipIcon"] svg { color: #64748b !important; }  /* help= "?" icons */

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
    color: #64748b !important;
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
@media (hover: hover) and (pointer: fine) {
    .stButton > button:hover {
        color: white;
        box-shadow: 0 6px 20px rgba(99,102,241,0.45);
    }
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
[data-testid="stHeader"] [data-testid="stAppDeployButton"],
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
[data-testid="stSidebar"] [data-baseweb="slider"] div[role="slider"] {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
    color: #1e293b !important;
}
[data-testid="stSidebar"] [data-baseweb="slider"] div[data-testid="stSliderTrackFill"] {
    background-color: #6366f1 !important;
}

/* ── Alerts (light) ──
   Streamlit colours st.warning/info/error/success from its own light/dark base,
   which follows the OS, not this toggle, so pin them to readable colours here ── */
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) { background-color: #fef3c7 !important; border: 1px solid #fcd34d !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) p, [data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) li, [data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) span { color: #92400e !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) svg { fill: #92400e !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) { background-color: #e0e7ff !important; border: 1px solid #c7d2fe !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) p, [data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) li, [data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) span { color: #3730a3 !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentInfo"]) svg { fill: #3730a3 !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) { background-color: #fee2e2 !important; border: 1px solid #fca5a5 !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) p, [data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) li, [data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) span { color: #991b1b !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) svg { fill: #991b1b !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) { background-color: #dcfce7 !important; border: 1px solid #86efac !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) p, [data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) li, [data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) span { color: #166534 !important; }
[data-testid="stMainBlockContainer"] [data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) svg { fill: #166534 !important; }
</style>
"""


_SVG_OPEN = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"'
)
_PIP = '<circle cx="{x}" cy="{y}" r="1.25" fill="currentColor" stroke="none"/>'
ICONS = {
    "dice": '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/>'
    + "".join(_PIP.format(x=x, y=y) for x, y in [(8.5, 8.5), (15.5, 8.5), (12, 12), (8.5, 15.5), (15.5, 15.5)]),
    "search": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    "chart": '<path d="M4 20h16"/><path d="M7 16v-5"/><path d="M12 16V7"/><path d="M17 16v-8"/>',
    "compass": '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
}


def icon_svg(name: str, css_class: str = "") -> str:
    """Inline SVG for one of ICONS (decorative, hidden from screen readers)."""
    cls = f' class="{css_class}"' if css_class else ""
    return f"{_SVG_OPEN}{cls}>{ICONS[name]}</svg>"


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


def set_meta_description(description: str):
    """Inject <meta name="description"> into the real document head, plus a skip link.

    Streamlit has no public API for this (st.set_page_config only controls
    <title> and the favicon), so this reaches into the parent document from
    a same-origin components.v1.html iframe, the standard workaround.

    The same script adds a "Skip to main content" link as the first focusable
    element. Streamlit puts the sidebar (page links, theme, filters) before the
    page content, so without it a keyboard user tabs through all of that first.
    """
    payload = json.dumps(description)
    components.html(
        f"""
        <script>
        (function() {{
            var doc = window.parent.document;
            // This helper's own zero-size iframe was an invisible tab stop on every page
            if (window.frameElement) {{
                window.frameElement.setAttribute('tabindex', '-1');
                window.frameElement.setAttribute('aria-hidden', 'true');
                window.frameElement.setAttribute('title', 'Page setup');
            }}
            var meta = doc.querySelector('meta[name="description"]');
            if (!meta) {{
                meta = doc.createElement('meta');
                meta.name = "description";
                doc.head.appendChild(meta);
            }}
            meta.content = {payload};

            var main = doc.querySelector('[data-testid="stMain"]');
            if (main) {{
                main.id = 'main-content';
                main.setAttribute('tabindex', '-1');
                main.style.outline = 'none';
            }}
            if (!doc.querySelector('.skip-link')) {{
                var skip = doc.createElement('a');
                skip.className = 'skip-link';
                skip.href = '#main-content';
                skip.textContent = 'Skip to main content';
                doc.body.insertBefore(skip, doc.body.firstChild);
            }}
        }})();
        </script>
        """,
        height=0,
        width=0,
    )


def chart_colors(theme_mode: str) -> dict:
    """Colours for the Altair charts on the Analytics page (transparent background, so
    they sit on the page itself). Bar colours keep at least 3:1 against the page."""
    if theme_mode == "Dark":
        return {
            "text": "#e2e8f0",
            "grid": "#334155",
            "primary": "#818cf8",
            "secondary": "#a78bfa",
            "accent": "#22d3ee",
        }
    return {
        "text": "#1e293b",
        "grid": "#c7d2fe",
        "primary": "#4338ca",
        "secondary": "#7c3aed",
        "accent": "#0369a1",
    }


def render_not_found(title: str, message: str, icon: str = "search", show_links: bool = False):
    """Themed 'not found' card — reused for empty results and the dedicated 404 page.

    title/message are escaped because the 404 page fills message from the ?reason=
    query param, which anyone can put in a link. Whitespace is collapsed too: a blank
    line would end the HTML block and let the rest render as Markdown (e.g. links).
    """
    title = " ".join(str(title).split())
    message = " ".join(str(message).split())
    st.markdown(
        f'''
        <div class="result-card" style="text-align:center;">
            <div class="home-card-icon">{icon_svg(icon)}</div>
            <div class="card-title">{html.escape(title)}</div>
            <div class="card-reason">{html.escape(message)}</div>
        </div>
        ''',
        unsafe_allow_html=True,
    )
    if show_links:
        c1, c2, c3 = st.columns(3)
        with c1:
            st.page_link("app.py", label="Home", icon=":material/home:")
        with c2:
            st.page_link("pages/1_Recommendation.py", label="Recommendations", icon=":material/casino:")
        with c3:
            st.page_link("pages/2_Analytics.py", label="Data charts", icon=":material/bar_chart:")
