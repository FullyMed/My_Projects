"""Strip PII (names, emails, phone numbers) before text is embedded for matching.

Originally vendored as-is from the original Talent_AI project
(src/talent_ai/extraction/anonymize.py); hardened here after AI insights
(Phase D) started sending `anonymized_text` to OpenAI and a live test showed
real names getting through -- until then this text never left the system, so
the gap was latent.

This is a deliberate fairness measure, not just data hygiene: ranking should be
driven by skills/experience content, not by names or contact details that can
carry demographic signal. It's a best-effort heuristic (regex + spaCy NER +
resume-header positional heuristics), not a guaranteed PII scrubber -- don't
rely on it for real candidate data without review.

Why spaCy's English NER alone isn't enough for the header: it needs sentence
context to recognize a PERSON, and a resume's own name line has none -- it's
often just the name, possibly split across two lines by PDF text extraction,
sometimes given in two scripts at once (e.g. "傅忠明 Maximilliano Felix
Gunawan"), and `en_core_web_sm` has no non-English NER at all. Since almost
every resume opens with the candidate's name, the header heuristic below
plugs that specific, common gap; the full-document spaCy pass still runs
after it and catches PERSON mentions elsewhere (e.g. "References: Jane Doe").
"""

from __future__ import annotations

import re

from .nlp_extractor import get_nlp

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}")

# Messaging handles resumes commonly list alongside (or instead of) a phone
# number. spaCy has no entity type for these, but they identify a person just
# as directly as an email would.
HANDLE_RE = re.compile(
    r"\b(?:LINE|WeChat|WhatsApp|Telegram|Skype|Kakao(?:Talk)?)\b\s*[:\-]?\s*@?[\w.]+",
    re.IGNORECASE,
)

# CJK ideographs have no whitespace between characters, so a short standalone
# run of them (e.g. "傅忠明") reads as one "word" once a line is split on
# whitespace -- this is what lets a Chinese name sit inside the same
# name-line check as a Latin one.
_CJK_RUN_RE = re.compile(r"[一-鿿]{2,4}")

# Words that legitimately open a resume without being a name -- checked
# per-word (not as a whole phrase) so "Curriculum Vitae" is excluded the same
# way "Objective" is.
_NON_NAME_HEADER_WORDS = {
    "resume", "cv", "curriculum", "vitae", "profile", "summary", "objective",
    "personal", "information", "about", "bio", "biography", "introduction",
    "portfolio", "contact", "details",
}

# How many of the document's leading non-empty lines count as "the header"
# for the name-line heuristic. Kept small and deliberately conservative: a
# false positive here only costs a section-header word (still redacted, but
# harmless to matching quality), while scanning the whole document would risk
# nuking real resume content that happens to be short and capitalized.
_HEADER_LINE_WINDOW = 2


def _looks_like_name_line(line: str) -> bool:
    """A short line made only of capitalized Latin words and/or short CJK
    runs, with nothing (digits, '@', '/') suggesting a sentence, date, or
    contact detail -- i.e. what a name line in a resume header looks like."""
    stripped = line.strip()
    if not stripped or len(stripped) > 60:
        return False
    if any(ch.isdigit() for ch in stripped) or "@" in stripped or "/" in stripped:
        return False

    words = stripped.split()
    if not words or len(words) > 5:
        return False
    if {w.lower().strip(":,.") for w in words} & _NON_NAME_HEADER_WORDS:
        return False

    return all(_CJK_RUN_RE.fullmatch(w) or (w[:1].isalpha() and w[:1].isupper()) for w in words)


def _redact_header_name(text: str) -> str:
    lines = text.split("\n")
    examined = 0
    for i, line in enumerate(lines):
        if not line.strip():
            continue
        if _looks_like_name_line(line):
            lines[i] = "[NAME]"
        examined += 1
        if examined >= _HEADER_LINE_WINDOW:
            break
    return "\n".join(lines)


def anonymize_text(text: str) -> str:
    text = EMAIL_RE.sub("[EMAIL]", text)
    text = PHONE_RE.sub("[PHONE]", text)
    text = HANDLE_RE.sub("[HANDLE]", text)
    text = _redact_header_name(text)

    nlp = get_nlp()
    doc = nlp(text)
    person_spans = sorted(
        (ent.start_char, ent.end_char) for ent in doc.ents if ent.label_ == "PERSON"
    )

    redacted = text
    for start, end in reversed(person_spans):
        redacted = redacted[:start] + "[NAME]" + redacted[end:]
    return redacted
