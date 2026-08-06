from talent_ai.automation import notifier


def test_send_report_email_skips_gracefully_when_unconfigured(tmp_path, monkeypatch):
    monkeypatch.setattr(notifier, "_REQUIRED_SETTINGS", (None, None, None, None, None))

    report_path = tmp_path / "report.md"
    report_path.write_text("# Report", encoding="utf-8")

    assert notifier.is_configured() is False
    assert notifier.send_report_email(report_path, subject="test") is False
