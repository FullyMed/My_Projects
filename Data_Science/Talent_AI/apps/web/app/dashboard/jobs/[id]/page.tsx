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
type Method = "semantic" | "tfidf" | "compare";

function SkillBadges({ skills, required }: { skills: string[]; required: string[] }) {
  const req = new Set(required);
  return (
    <div className="flex flex-wrap gap-1 pt-0.5">
      {skills.slice(0, 8).map((skill) => (
        <Badge key={skill} tone={req.has(skill) ? "accent" : "default"}>
          {skill}
        </Badge>
      ))}
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [tfidfResults, setTfidfResults] = useState<MatchResult[] | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap[] | null>(null);
  const [method, setMethod] = useState<Method>("semantic");
  const [topK, setTopK] = useState(10);
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

  const fetchTfidf = useCallback(async () => {
    const ranked = await apiFetch<MatchResult[]>(`/jobs/${id}/rank?method=tfidf&top_k=${topK}`, {
      method: "POST",
    });
    setTfidfResults(ranked);
  }, [id, topK]);

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
      const ranked = await apiFetch<MatchResult[]>(`/jobs/${id}/rank?top_k=${topK}`, {
        method: "POST",
      });
      setResults(ranked);
      setTfidfResults(null); // stale after a top_k change
      loadSkillGap();
    } catch (err) {
      setError(String(err));
    } finally {
      setRanking(false);
    }
  }

  async function selectMethod(next: Method) {
    setError(null);
    if ((next === "tfidf" || next === "compare") && tfidfResults === null) {
      setRanking(true);
      try {
        await fetchTfidf();
        setMethod(next);
      } catch (err) {
        setError(String(err));
      } finally {
        setRanking(false);
      }
      return;
    }
    setMethod(next);
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

  const displayed = method === "tfidf" ? tfidfResults : results;
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
          <div className="flex shrink-0 items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted">
              Top
              <input
                type="number"
                min={5}
                max={25}
                value={topK}
                onChange={(e) =>
                  setTopK(Math.max(5, Math.min(25, Number(e.target.value) || 10)))
                }
                className="w-14 rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none focus:border-accent"
              />
            </label>
            <Button loading={ranking} onClick={handleRerank}>
              {ranking ? "Ranking..." : "Re-rank"}
            </Button>
          </div>
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

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          {(["semantic", "tfidf", "compare"] as Method[]).map((m) => (
            <Button
              key={m}
              variant={method === m ? "secondary" : "ghost"}
              onClick={() => selectMethod(m)}
              className="px-3 py-1.5"
            >
              {m === "semantic" ? "Semantic" : m === "tfidf" ? "Keyword (TF-IDF)" : "Compare"}
            </Button>
          ))}
        </div>
        {method !== "semantic" && (
          <span className="text-xs text-muted">Comparison only — not saved</span>
        )}
      </div>

      {ranking && method !== "semantic" && (
        <div className="flex justify-center py-8">
          <Spinner className="h-5 w-5 text-muted" />
        </div>
      )}

      {method === "compare" && results && tfidfResults && (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: "Semantic", rows: results },
            { label: "Keyword (TF-IDF)", rows: tfidfResults },
          ].map(({ label, rows }) => (
            <div key={label} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted">{label}</h3>
              {rows.map((result) => (
                <Card key={result.candidate_id} className="flex items-center gap-3 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                    {result.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/dashboard/candidates/${result.candidate_id}`}
                      className="text-sm font-medium hover:text-accent"
                    >
                      {result.category ?? "Uncategorized"}
                    </a>
                    <span className="ml-2 text-xs text-muted">
                      {(result.score * 100).toFixed(1)}%
                    </span>
                    <SkillBadges skills={result.skills} required={job.required_skills} />
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      {method !== "compare" && displayed && displayed.length === 0 && (
        <EmptyState
          title="No ranking yet"
          description="Click Re-rank to score your candidates against this job."
        />
      )}

      {method !== "compare" && displayed && displayed.length > 0 && (
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
                  <SkillBadges skills={result.skills} required={job.required_skills} />
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
