"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, errorMessage } from "@/lib/api";
import { Button, Card, EmptyState, ErrorText, Field, Input, Spinner, Textarea } from "@/components/ui";
import { SAMPLE_JDS } from "@/lib/sampleJds";

const PAGE_SIZE = 20;

type Job = { id: string; title: string; raw_text: string; created_at: string };

export default function JobsPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
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
      setError(errorMessage(err));
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
      const skills = requiredSkills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const job = await apiFetch<Job>("/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, raw_text: rawText, required_skills: skills }),
      });
      await apiFetch(`/jobs/${job.id}/rank`, { method: "POST" });
      router.push(`/dashboard/jobs/${job.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Rank candidates</h1>
        <p className="text-sm text-muted">
          Paste a job description and we&apos;ll rank your candidates by how well they fit it.
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>Try a sample:</span>
            {SAMPLE_JDS.map((jd) => (
              <button
                key={jd.label}
                type="button"
                onClick={() => {
                  setTitle(jd.title);
                  setRawText(jd.text);
                }}
                className="min-h-8 rounded-md border border-border px-2.5 py-1 font-medium text-foreground transition-[background-color,transform] duration-150 ease-snappy hover:bg-surface-hover motion-safe:active:scale-[0.97]"
              >
                {jd.label}
              </button>
            ))}
          </div>
          <Field label="Job title" htmlFor="job-title">
            <Input
              id="job-title"
              placeholder="Backend Engineer"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>
          <Field label="Job description" htmlFor="job-description">
            <Textarea
              id="job-description"
              className="min-h-40"
              placeholder="Paste the job description here"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              required
            />
          </Field>
          <Field
            label="Extra required skills (optional)"
            htmlFor="job-skills"
            hint="We pick most skills out of the description for you. Add any we might miss, separated by commas."
          >
            <Input
              id="job-skills"
              placeholder="python, aws"
              value={requiredSkills}
              onChange={(event) => setRequiredSkills(event.target.value)}
            />
          </Field>
          <Button type="submit" loading={submitting} className="w-fit">
            {submitting ? "Ranking..." : "Rank candidates"}
          </Button>
        </form>
      </Card>

      {error && <ErrorText>{error}</ErrorText>}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">Your jobs</h2>
        {loadingJobs ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6 text-muted" />
          </div>
        ) : jobs.length === 0 && offset === 0 ? (
          <EmptyState
            title="No jobs yet"
            description="Jobs you create will show up here."
          />
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {jobs.map((job) => (
                <a key={job.id} href={`/dashboard/jobs/${job.id}`} className="rounded-xl">
                  <Card className="p-4 transition-colors hover:bg-surface-hover">
                    <div className="flex items-start justify-between gap-4">
                      <span className="min-w-0 font-medium">{job.title}</span>
                      <span className="shrink-0 pt-0.5 text-xs text-muted tabular-nums">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">{job.raw_text}</p>
                  </Card>
                </a>
              ))}
            </div>
            {(offset > 0 || jobs.length === PAGE_SIZE) && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
