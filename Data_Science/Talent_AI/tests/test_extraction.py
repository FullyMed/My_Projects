from talent_ai.extraction.anonymize import anonymize_text
from talent_ai.extraction.nlp_extractor import extract_education, extract_experience, extract_skills


def test_extract_skills_finds_known_skills():
    text = "Proficient in Python, SQL, and machine learning. Experience with AWS and Docker."
    skills = extract_skills(text)
    assert "python" in skills
    assert "sql" in skills
    assert "machine learning" in skills


def test_extract_education_section():
    text = (
        "Summary\nDid stuff.\n\n"
        "Education\nB.S. Computer Science, State University, 2020\n\n"
        "Experience\nSoftware Engineer at Acme Corp"
    )
    education = extract_education(text)
    assert any("Computer Science" in line for line in education)
    assert all("Acme Corp" not in line for line in education)


def test_extract_experience_section():
    text = "Education\nB.S. Computer Science\n\nExperience\nSoftware Engineer at Acme Corp, 2020-2023"
    experience = extract_experience(text)
    assert any("Acme Corp" in line for line in experience)


def test_anonymize_strips_email_and_phone():
    text = "Contact John Smith at john.smith@example.com or (555) 123-4567."
    redacted = anonymize_text(text)
    assert "john.smith@example.com" not in redacted
    assert "[EMAIL]" in redacted
    assert "[PHONE]" in redacted
