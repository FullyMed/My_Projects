"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Badge, Button, Spinner } from "@/components/ui";

export type CandidateInsights = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missing_qualifications: string[];
  hiring_recommendation: string;
  interview_questions: string[];
};

type InsightRow = {
  insights: CandidateInsights;
  model: string;
  input_tokens: number;
  output_tokens: number;
  updated_at: string;
};

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-xs font-medium text-muted">{title}</h4>
      <ul className="list-disc pl-5 text-sm marker:text-muted">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** AI insights for one candidate evaluated against one job. Shared by the job
 * ranking page and the candidate detail page — both hit the same
 * POST/GET /candidates/{id}/insights?job_id= endpoint and the same cache. */
export function InsightsPanel({
  candidateId,
  jobId,
}: {
  candidateId: string;
  jobId: string | null;
}) {
  const [row, setRow] = useState<InsightRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load any cached insight whenever the candidate/job pair changes. Resetting
  // state here on key change is intentional (same pattern as the list pages).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    setError(null);
    setRow(null);
    if (!jobId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch<InsightRow | null>(`/candidates/${candidateId}/insights?job_id=${jobId}`)
      .then((data) => !cancelled && setRow(data ?? null))
      .catch((err) => !cancelled && setError(String(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [candidateId, jobId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function generate(refresh: boolean) {
    if (!jobId) return;
    setGenerating(true);
    setError(null);
    try {
      const data = await apiFetch<InsightRow>(
        `/candidates/${candidateId}/insights?job_id=${jobId}${refresh ? "&refresh=true" : ""}`,
        { method: "POST" },
      );
      setRow(data);
    } catch (err) {
      const msg = String(err);
      setError(
        msg.includes("503")
          ? "AI insights aren't configured on the server yet (missing OpenAI key)."
          : msg.includes("402")
            ? "Monthly AI usage limit reached for your workspace. It resets at the start of next month."
            : msg,
      );
    } finally {
      setGenerating(false);
    }
  }

  if (!jobId) {
    return <p className="text-sm text-muted">Pick a job to evaluate this candidate against.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="h-5 w-5 text-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-danger">{error}</p>}

      {!row && !generating && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted">No insights generated for this job yet.</p>
          <Button onClick={() => generate(false)} className="px-3 py-1.5">
            Generate insights
          </Button>
        </div>
      )}

      {generating && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Spinner className="h-4 w-4" /> Analyzing candidate…
        </div>
      )}

      {row && (
        <div className="flex flex-col gap-4">
          <p className="text-sm">{row.insights.summary}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Section title="Strengths" items={row.insights.strengths} />
            <Section title="Weaknesses / gaps" items={row.insights.weaknesses} />
            <Section title="Missing qualifications" items={row.insights.missing_qualifications} />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-medium text-muted">Hiring recommendation</h4>
            <p className="text-sm">{row.insights.hiring_recommendation}</p>
          </div>
          <Section title="Suggested interview questions" items={row.insights.interview_questions} />
          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="secondary"
              loading={generating}
              onClick={() => generate(true)}
              className="px-3 py-1.5"
            >
              Regenerate
            </Button>
            <Badge>
              {row.model} · {row.input_tokens + row.output_tokens} tokens
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
