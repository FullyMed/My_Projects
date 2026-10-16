"""User-facing messages that more than one module raises.

The frontend shows an error response's `detail` to the user as is (see
apps/web/lib/api.ts), so every `detail` is a full sentence written for a
recruiter, not a developer. One-off messages stay next to the code that
raises them; these live here because several call sites share them.
"""

CANDIDATE_NOT_FOUND = "We couldn't find that candidate."
JOB_NOT_FOUND = "We couldn't find that job."
BILLING_NOT_SET_UP = "Billing isn't set up yet. Try again later."
