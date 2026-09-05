"""Regression tests for the anonymizer, added after a live AI-insights test
showed real candidate names reaching OpenAI. Covers the two concrete failure
modes seen in production: a name split across two PDF-extraction lines, and
a name given in two scripts on one line -- plus the pre-existing email/phone
redaction and a false-positive guard for legitimate section headers.
"""

from __future__ import annotations

from talent_ai_core.extraction.anonymize import anonymize_text


def test_email_and_phone_still_redacted():
    text = "Contact me at jane.doe@example.com or 415-555-0134."
    result = anonymize_text(text)
    assert "jane.doe@example.com" not in result
    assert "415-555-0134" not in result
    assert "[EMAIL]" in result and "[PHONE]" in result


def test_messaging_handle_redacted():
    result = anonymize_text("Reach me on LINE: @zhongm1ng for questions.")
    assert "zhongm1ng" not in result
    assert "[HANDLE]" in result


def test_handle_regex_does_not_match_inside_ordinary_words():
    # Regression: an early version matched "line" inside "offline" (missing
    # word boundaries), mangling unrelated resume text.
    result = anonymize_text("Designed API-ready architecture with offline fallback.")
    assert "offline fallback" in result
    assert "[HANDLE]" not in result


def test_name_split_across_two_lines_is_redacted():
    # Real failure case: a PDF text extraction put the candidate's first and
    # last name on separate lines with no space, which spaCy's NER missed.
    text = "Maximilliano\nFelixGunawan\nComputer Science student\nTaipei, Taiwan"
    result = anonymize_text(text)
    assert "Maximilliano" not in result
    assert "FelixGunawan" not in result
    assert result.count("[NAME]") >= 2
    assert "Computer Science student" in result  # body text untouched


def test_bilingual_header_name_is_redacted():
    # Real failure case: Chinese + romanized name on the same header line --
    # en_core_web_sm has no Chinese NER at all, and the Latin half is split
    # from normal sentence context, so spaCy alone catches neither.
    text = "傅忠明 Maximilliano Felix Gunawan \n學生 \n台中，台灣"
    result = anonymize_text(text)
    assert "傅忠明" not in result
    assert "Maximilliano" not in result
    assert "[NAME]" in result
    assert "台中，台灣" in result  # unrelated CJK content elsewhere is untouched


def test_legitimate_section_header_is_not_redacted():
    text = "Objective\nSeeking a backend engineering role.\njohn@x.com"
    result = anonymize_text(text)
    assert "Objective" in result


def test_header_window_does_not_touch_body_text():
    # Only the first couple of lines are eligible for the header heuristic --
    # a short capitalized line further down (e.g. a job title) is left alone.
    text = "Alex Rivera\nSummary line here.\nSenior Backend Engineer\nBuilt APIs."
    result = anonymize_text(text)
    assert "Senior Backend Engineer" in result
