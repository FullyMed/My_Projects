"use client";

import { useEffect, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api";
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
 * ranking page and the candidate detail page. Both hit the same
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
      .catch((err) => !cancelled && setError(errorMessage(err)))
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
      // The server's message already covers the cases worth explaining: the
      // monthly AI allowance (402) and insights not being set up (503).
      setError(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  if (!jobId) {
    return <p className="text-sm text-muted">Choose a job above to see how this candidate fits it.</p>;
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
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {!row && !generating && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">No AI review for this job yet.</p>
          <Button onClick={() => generate(false)} className="px-3">
            Generate insights
          </Button>
        </div>
      )}

      {generating && (
        <div role="status" className="flex items-center gap-2 text-sm text-muted">
          <Spinner className="h-4 w-4" decorative /> Reading the resume…
        </div>
      )}

      {row && (
        <div className="reveal flex flex-col gap-4">
          <p className="text-sm">{row.insights.summary}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Section title="Strengths" items={row.insights.strengths} />
            <Section title="Gaps" items={row.insights.weaknesses} />
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
          <p className="text-xs text-muted">
            An AI wrote this from the anonymized resume. It can be wrong, so check it before you
            rely on it.
          </p>
        </div>
      )}
    </div>
  );
}
