"""Strip PII (names, emails, phone numbers) before text is embedded for matching.

This is a deliberate fairness measure, not just data hygiene: ranking should be
driven by skills/experience content, not by names or contact details that can
carry demographic signal. It's a best-effort heuristic (regex + spaCy NER), not a
guaranteed PII scrubber — don't rely on it for real candidate data without review.
"""

from __future__ import annotations

import re

from .nlp_extractor import get_nlp

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}")


def anonymize_text(text: str) -> str:
    text = EMAIL_RE.sub("[EMAIL]", text)
    text = PHONE_RE.sub("[PHONE]", text)

    nlp = get_nlp()
    doc = nlp(text)
    person_spans = sorted(
        (ent.start_char, ent.end_char) for ent in doc.ents if ent.label_ == "PERSON"
    )

    redacted = text
    for start, end in reversed(person_spans):
        redacted = redacted[:start] + "[NAME]" + redacted[end:]
    return redacted
