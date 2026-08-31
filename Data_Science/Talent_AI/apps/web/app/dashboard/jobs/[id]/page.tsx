"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Badge, Button, Card, EmptyState, ErrorText, Spinner } from "@/components/ui";
import { InsightsPanel } from "@/components/insights";

type Job = {
  id: string;
  title: string;
  raw_text: string;
  required_skills: string[];
  created_at: string;
};
type MatchResult = {
  candidate_id: string;
  score: number;
  rank: number;
  source_path: string;
  category: string | null;
  skills: string[];
};
type SkillGap = { skill: string; missing_fraction: number };
type Method = "semantic" | "tfidf";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [tfidfResults, setTfidfResults] = useState<MatchResult[] | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap[] | null>(null);
  const [method, setMethod] = useState<Method>("semantic");
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openInsights, setOpenInsights] = useState<Set<string>>(new Set());

  function toggleInsights(candidateId: string) {
    setOpenInsights((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  }

  const loadSkillGap = useCallback(() => {
    apiFetch<SkillGap[]>(`/jobs/${id}/skill-gap`)
      .then(setSkillGap)
      .catch(() => setSkillGap([]));
  }, [id]);

  useEffect(() => {
    Promise.all([apiFetch<Job>(`/jobs/${id}`), apiFetch<MatchResult[]>(`/jobs/${id}/results`)])
      .then(([jobData, resultsData]) => {
        setJob(jobData);
        setResults(resultsData);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
    loadSkillGap();
  }, [id, loadSkillGap]);

  async function handleRerank() {
    setRanking(true);
    setError(null);
    try {
      const ranked = await apiFetch<MatchResult[]>(`/jobs/${id}/rank`, { method: "POST" });
      setResults(ranked);
      loadSkillGap();
    } catch (err) {
      setError(String(err));
    } finally {
      setRanking(false);
    }
  }

  async function selectMethod(next: Method) {
    setMethod(next);
    setError(null);
    if (next === "tfidf" && tfidfResults === null) {
      setRanking(true);
      try {
        const ranked = await apiFetch<MatchResult[]>(`/jobs/${id}/rank?method=tfidf`, {
          method: "POST",
        });
        setTfidfResults(ranked);
      } catch (err) {
        setError(String(err));
        setMethod("semantic");
      } finally {
        setRanking(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-muted" />
      </div>
    );
  }

  if (error && !job) {
    return <ErrorText>{error}</ErrorText>;
  }
  if (!job) {
    return <ErrorText>Job not found.</ErrorText>;
  }

  const displayed = method === "semantic" ? results : tfidfResults;
  const showSkillGap =
    method === "semantic" &&
    job.required_skills.length > 0 &&
    (results?.length ?? 0) > 0 &&
    (skillGap?.length ?? 0) > 0;

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
        {method === "semantic" && (
          <Button loading={ranking} onClick={handleRerank} className="shrink-0">
            {ranking ? "Ranking..." : "Re-rank"}
          </Button>
        )}
      </div>

      <Card className="p-5">
        <h2 className="mb-2 text-sm font-medium text-muted">Job description</h2>
        <p className="whitespace-pre-wrap text-sm">{job.raw_text}</p>
        {job.required_skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {job.required_skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        )}
      </Card>

      {error && <ErrorText>{error}</ErrorText>}

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <Button
            variant={method === "semantic" ? "secondary" : "ghost"}
            onClick={() => selectMethod("semantic")}
            className="px-3 py-1.5"
          >
            Semantic
          </Button>
          <Button
            variant={method === "tfidf" ? "secondary" : "ghost"}
            onClick={() => selectMethod("tfidf")}
            className="px-3 py-1.5"
          >
            Keyword (TF-IDF)
          </Button>
        </div>
        {method === "tfidf" && (
          <span className="text-xs text-muted">Comparison only — not saved</span>
        )}
      </div>

      {ranking && method === "tfidf" && (
        <div className="flex justify-center py-8">
          <Spinner className="h-5 w-5 text-muted" />
        </div>
      )}

      {displayed && displayed.length === 0 && (
        <EmptyState
          title="No ranking yet"
          description="Click Re-rank to score your candidates against this job."
        />
      )}

      {displayed && displayed.length > 0 && (
        <div className="flex flex-col gap-2">
          {displayed.map((result) => (
            <Card key={result.candidate_id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-4">
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
                {method === "semantic" && (
                  <Button
                    variant="ghost"
                    onClick={() => toggleInsights(result.candidate_id)}
                    className="shrink-0 px-2.5 py-1.5 text-xs"
                  >
                    {openInsights.has(result.candidate_id) ? "Hide insights" : "AI insights"}
                  </Button>
                )}
              </div>
              {method === "semantic" && openInsights.has(result.candidate_id) && (
                <div className="border-t border-border pt-3">
                  <InsightsPanel candidateId={result.candidate_id} jobId={id} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showSkillGap && (
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-medium text-muted">Skill gaps in your shortlist</h2>
          <p className="mb-4 text-xs text-muted">
            Share of the ranked candidates missing each required skill.
          </p>
          <div className="flex flex-col gap-3">
            {skillGap!.map(({ skill, missing_fraction }) => (
              <div key={skill} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{skill}</span>
                  <span className="text-muted">
                    {(missing_fraction * 100).toFixed(0)}% missing
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-danger"
                    style={{ width: `${Math.max(0, Math.min(100, missing_fraction * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
