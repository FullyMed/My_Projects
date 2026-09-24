"""Unit tests for report_service. The admin Supabase client and email sending
are both mocked -- no real DB, no real email, and (structurally, by this
module's own imports) no OpenAI call is even reachable from this code path.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from app.services import report_service as rs


def _resp(data):
    r = MagicMock()
    r.data = data
    return r


JOB = {
    "id": "job-1",
    "tenant_id": "tenant-1",
    "title": "Backend Engineer",
    "required_skills": ["python", "aws"],
    "embedding": "[" + ",".join(["0.1"] * 384) + "]",
}
RANKED = [
    {"id": "cand-1", "category": "ENGINEERING", "skills": ["python"], "score": 0.9},
    {"id": "cand-2", "category": "FINANCE", "skills": [], "score": 0.2},
]


def test_run_weekly_reports_only_processes_opted_in_jobs():
    admin = MagicMock()
    admin.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        _resp([JOB]),  # job_descriptions where email_reports_enabled = true
        _resp([{"email": "owner@acme.com", "role": "owner"}]),  # profiles for tenant-1
    ]
    admin.rpc.return_value.execute.return_value = _resp(RANKED)

    with patch.object(rs, "get_admin_client", return_value=admin), patch.object(
        rs.email_service, "send_email", return_value=True
    ) as send:
        result = rs.run_weekly_reports()

    assert result["jobs_processed"] == 1
    assert result["results"] == [{"job_id": "job-1", "status": "sent"}]

    # Only jobs matching email_reports_enabled=true were ever queried for.
    admin.table.return_value.select.return_value.eq.assert_any_call(
        "email_reports_enabled", True
    )

    # The digest went to the tenant owner, ranked via the tenant-scoped RPC.
    rpc_name, rpc_args = admin.rpc.call_args.args
    assert rpc_name == "match_candidates_for_tenant"
    assert rpc_args["p_tenant_id"] == "tenant-1"
    send_kwargs = send.call_args.kwargs
    assert send_kwargs["to"] == "owner@acme.com"
    assert "Backend Engineer" in send_kwargs["subject"]
    assert "python" in send_kwargs["body"]  # matched skill shows in the digest


def test_run_weekly_reports_skips_job_with_no_recipient():
    admin = MagicMock()
    admin.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        _resp([JOB]),
        _resp([]),  # no profiles for this tenant
    ]

    with patch.object(rs, "get_admin_client", return_value=admin), patch.object(
        rs.email_service, "send_email"
    ) as send:
        result = rs.run_weekly_reports()

    assert result["results"] == [
        {"job_id": "job-1", "status": "skipped", "detail": "no recipient email on this tenant"}
    ]
    send.assert_not_called()
    admin.rpc.assert_not_called()  # never even bothered ranking


def test_run_weekly_reports_empty_when_nothing_opted_in():
    admin = MagicMock()
    admin.table.return_value.select.return_value.eq.return_value.execute.return_value = _resp([])

    with patch.object(rs, "get_admin_client", return_value=admin):
        result = rs.run_weekly_reports()

    assert result == {"jobs_processed": 0, "results": []}


def test_report_service_never_imports_openai_insights():
    # Structural guard, not a mock -- this module's actual import statements
    # (not its docstrings, which are free to explain that principle in
    # English) must stay free of anything that could reach OpenAI, since
    # that's what actually enforces "automation never silently costs money
    # on a timer."
    import ast
    import inspect

    tree = ast.parse(inspect.getsource(rs))
    imported = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imported.add(node.module)

    assert not any("insight" in name.lower() or "openai" in name.lower() for name in imported)
