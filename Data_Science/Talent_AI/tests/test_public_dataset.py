from talent_ai.public_dataset import redact_for_public
from talent_ai.schemas import CandidateProfile


def test_redact_for_public_replaces_raw_text_only():
    profile = CandidateProfile(
        candidate_id="a",
        source_path="a.pdf",
        category="INFORMATION-TECHNOLOGY",
        raw_text="Jane Doe, jane.doe@example.com, (555) 123-4567. Python developer.",
        anonymized_text="[NAME], [EMAIL], [PHONE]. Python developer.",
        skills=["python"],
        education=["B.S. Computer Science"],
        experience=["Software Engineer at Acme"],
        embedding=[0.1, 0.2],
    )

    redacted = redact_for_public(profile)

    assert redacted.raw_text == profile.anonymized_text
    assert "Jane Doe" not in redacted.raw_text
    assert "jane.doe@example.com" not in redacted.raw_text

    # everything else is untouched
    assert redacted.candidate_id == profile.candidate_id
    assert redacted.category == profile.category
    assert redacted.skills == profile.skills
    assert redacted.education == profile.education
    assert redacted.experience == profile.experience
    assert redacted.embedding == profile.embedding

    # original profile object is not mutated
    assert profile.raw_text != profile.anonymized_text
