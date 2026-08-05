"""Skill / education / experience extraction from resume text.

Skill extraction uses a spaCy PhraseMatcher against a curated taxonomy rather than
generic NER, since off-the-shelf spaCy models have no "SKILL" entity type (this
mirrors how existing open-source resume parsers, e.g. pyresparser, approach it).
Education/experience use section-header heuristics, which is simple but works well
enough on the structured, single-column resumes in the target dataset.
"""

from __future__ import annotations

import spacy
from spacy.matcher import PhraseMatcher

from .skills_taxonomy import ALL_SKILLS

_NLP: spacy.language.Language | None = None
_SKILL_MATCHER: PhraseMatcher | None = None

SECTION_HEADERS = {
    "education": ["education", "academic background", "academic qualifications", "qualifications"],
    "experience": ["experience", "work experience", "employment history", "professional experience"],
}
_ALL_HEADER_KEYWORDS = [kw for kws in SECTION_HEADERS.values() for kw in kws]
_MAX_HEADER_LINE_LEN = 40


def get_nlp() -> spacy.language.Language:
    global _NLP
    if _NLP is None:
        _NLP = spacy.load("en_core_web_sm")
    return _NLP


def _get_skill_matcher() -> PhraseMatcher:
    global _SKILL_MATCHER
    if _SKILL_MATCHER is None:
        nlp = get_nlp()
        matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
        matcher.add("SKILL", [nlp.make_doc(skill) for skill in ALL_SKILLS])
        _SKILL_MATCHER = matcher
    return _SKILL_MATCHER


def extract_skills(text: str) -> list[str]:
    nlp = get_nlp()
    matcher = _get_skill_matcher()
    doc = nlp(text)
    matches = matcher(doc)
    found = {doc[start:end].text.lower() for _, start, end in matches}
    return sorted(found)


def _is_header_line(line: str, keywords: list[str]) -> bool:
    normalized = line.lower().strip(" :\t-")
    if len(normalized) > _MAX_HEADER_LINE_LEN:
        return False
    return any(normalized == kw or normalized.startswith(kw) for kw in keywords)


def _extract_section(text: str, header_keywords: list[str]) -> list[str]:
    lines = [line.strip() for line in text.splitlines()]

    start_idx = next(
        (i + 1 for i, line in enumerate(lines) if _is_header_line(line, header_keywords)),
        None,
    )
    if start_idx is None:
        return []

    section_lines: list[str] = []
    for line in lines[start_idx:]:
        if _is_header_line(line, _ALL_HEADER_KEYWORDS):
            break
        if line:
            section_lines.append(line)
    return section_lines


def extract_education(text: str) -> list[str]:
    return _extract_section(text, SECTION_HEADERS["education"])


def extract_experience(text: str) -> list[str]:
    return _extract_section(text, SECTION_HEADERS["experience"])


def extract_all(text: str) -> dict[str, list[str]]:
    return {
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
    }
