"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { Badge, Button, Card, EmptyState, ErrorText, Input, Textarea } from "@/components/ui";

type Job = { id: string; title: string; raw_text: string };
type MatchResult = {
  candidate_id: string;
  score: number;
  rank: number;
  source_path: string;
  category: string | null;
  skills: string[];
};

export default function JobsPage() {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResults(null);

    try {
      const job = await apiFetch<Job>("/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, raw_text: rawText, required_skills: [] }),
      });
      const ranked = await apiFetch<MatchResult[]>(`/jobs/${job.id}/rank`, { method: "POST" });
      setResults(ranked);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Rank candidates</h1>
        <p className="text-sm text-muted">
          Paste a job description to find the best-matching candidates by semantic similarity.
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Job title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <Textarea
            className="min-h-40"
            placeholder="Paste the job description here"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            required
          />
          <Button type="submit" loading={submitting} className="w-fit">
            {submitting ? "Ranking..." : "Rank candidates"}
          </Button>
        </form>
      </Card>

      {error && <ErrorText>{error}</ErrorText>}

      {results && results.length === 0 && (
        <EmptyState
          title="No candidates to rank yet"
          description="Upload some resumes on the Candidates page first."
        />
      )}

      {results && results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((result) => (
            <Card key={result.candidate_id} className="flex items-center gap-4 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                {result.rank}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{result.category ?? "Uncategorized"}</span>
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
