"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Badge, Button, Card, EmptyState, ErrorText, Spinner } from "@/components/ui";

type Job = { id: string; title: string; raw_text: string; created_at: string };
type MatchResult = {
  candidate_id: string;
  score: number;
  rank: number;
  source_path: string;
  category: string | null;
  skills: string[];
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiFetch<Job>(`/jobs/${id}`), apiFetch<MatchResult[]>(`/jobs/${id}/results`)])
      .then(([jobData, resultsData]) => {
        setJob(jobData);
        setResults(resultsData);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRerank() {
    setRanking(true);
    setError(null);
    try {
      const ranked = await apiFetch<MatchResult[]>(`/jobs/${id}/rank`, { method: "POST" });
      setResults(ranked);
    } catch (err) {
      setError(String(err));
    } finally {
      setRanking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-muted" />
      </div>
    );
  }

  if (error || !job) {
    return <ErrorText>{error ?? "Job not found."}</ErrorText>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <a href="/dashboard/jobs" className="text-sm text-muted hover:text-foreground">
            ← Back to jobs
          </a>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{job.title}</h1>
          <p className="text-sm text-muted">
            Created {new Date(job.created_at).toLocaleString()}
          </p>
        </div>
        <Button loading={ranking} onClick={handleRerank} className="shrink-0">
          {ranking ? "Ranking..." : "Re-rank"}
        </Button>
      </div>

      <Card className="p-5">
        <h2 className="mb-2 text-sm font-medium text-muted">Job description</h2>
        <p className="whitespace-pre-wrap text-sm">{job.raw_text}</p>
      </Card>

      {error && <ErrorText>{error}</ErrorText>}

      {results && results.length === 0 && (
        <EmptyState
          title="No ranking yet"
          description="Click Re-rank to score your candidates against this job."
        />
      )}

      {results && results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((result) => (
            <Card key={result.candidate_id} className="flex items-center gap-4 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                {result.rank}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <a
                    href={`/dashboard/candidates/${result.candidate_id}`}
                    className="font-medium hover:text-accent"
                  >
                    {result.category ?? "Uncategorized"}
                  </a>
                  <span className="text-xs text-muted">
                    {(result.score * 100).toFixed(1)}% match
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(0, Math.min(100, result.score * 100))}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {result.skills.slice(0, 6).map((skill) => (
                    <Badge key={skill} tone="accent">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
