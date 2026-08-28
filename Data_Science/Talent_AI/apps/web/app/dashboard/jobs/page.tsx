"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button, Card, EmptyState, ErrorText, Input, Textarea } from "@/components/ui";

const PAGE_SIZE = 20;

type Job = { id: string; title: string; raw_text: string; created_at: string };

export default function JobsPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [offset, setOffset] = useState(0);

  async function loadJobs(atOffset: number) {
    setLoadingJobs(true);
    try {
      const data = await apiFetch<Job[]>(`/jobs?limit=${PAGE_SIZE}&offset=${atOffset}`);
      setJobs(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => {
    loadJobs(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const job = await apiFetch<Job>("/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, raw_text: rawText, required_skills: [] }),
      });
      await apiFetch(`/jobs/${job.id}/rank`, { method: "POST" });
      router.push(`/dashboard/jobs/${job.id}`);
    } catch (err) {
      setError(String(err));
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

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">Past jobs</h2>
        {loadingJobs ? (
          <div className="flex justify-center py-8">
            <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
          </div>
        ) : jobs.length === 0 && offset === 0 ? (
          <EmptyState
            title="No jobs yet"
            description="Create one above to see it show up here."
          />
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {jobs.map((job) => (
                <a key={job.id} href={`/dashboard/jobs/${job.id}`}>
                  <Card className="p-4 transition-colors hover:bg-surface-hover">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{job.title}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">{job.raw_text}</p>
                  </Card>
                </a>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={jobs.length < PAGE_SIZE}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
