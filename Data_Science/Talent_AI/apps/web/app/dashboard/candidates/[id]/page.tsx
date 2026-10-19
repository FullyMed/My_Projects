"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, errorMessage } from "@/lib/api";
import { Badge, Button, Card, ErrorText, Select, Spinner } from "@/components/ui";
import { InsightsPanel } from "@/components/insights";

type CandidateDetail = {
  id: string;
  source_path: string;
  category: string | null;
  anonymized_text: string;
  skills: string[];
  education: string[];
  experience: string[];
  created_at: string;
};

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  useEffect(() => {
    apiFetch<CandidateDetail>(`/candidates/${id}`)
      .then(setCandidate)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
    apiFetch<{ id: string; title: string }[]>(`/jobs?limit=100`)
      .then(setJobs)
      .catch(() => setJobs([]));
  }, [id]);

  async function handleViewResume() {
    setResumeLoading(true);
    try {
      const { url } = await apiFetch<{ url: string }>(`/candidates/${id}/resume-url`);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setResumeLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("This candidate and their resume will be deleted. You can't undo this.")) return;
    setDeleting(true);
    try {
      await apiFetch(`/candidates/${id}`, { method: "DELETE" });
      router.push("/dashboard/candidates");
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-muted" />
      </div>
    );
  }

  if (error || !candidate) {
    return <ErrorText>{error ?? "We couldn't find that candidate."}</ErrorText>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <a href="/dashboard/candidates" className="inline-block rounded-md py-1 text-sm text-muted hover:text-foreground">
            ← Back to candidates
          </a>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {candidate.category ?? "Uncategorized candidate"}
          </h1>
          <p className="text-sm text-muted tabular-nums">
            Uploaded {new Date(candidate.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" loading={resumeLoading} onClick={handleViewResume}>
            View resume
          </Button>
          <Button
            variant="secondary"
            loading={deleting}
            onClick={handleDelete}
            className="border-danger/30 text-danger hover:bg-danger/10"
          >
            Delete
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-medium text-muted">Skills</h2>
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.length > 0 ? (
            candidate.skills.map((skill) => (
              <Badge key={skill} tone="accent">
                {skill}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted">None found</span>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-muted">AI insights</h2>
          <Select
            aria-label="Job to review this candidate against"
            value={selectedJobId}
            onChange={(event) => setSelectedJobId(event.target.value)}
            className="py-2 sm:w-auto sm:max-w-xs"
          >
            <option value="">Choose a job…</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </Select>
        </div>
        <InsightsPanel candidateId={id} jobId={selectedJobId || null} />
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-medium text-muted">Education</h2>
        {candidate.education.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm">
            {candidate.education.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted">None found</span>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-medium text-muted">Experience</h2>
        {candidate.experience.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm">
            {candidate.experience.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted">None found</span>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-sm font-medium text-muted">Resume text used for matching</h2>
        <p className="mb-3 text-xs text-muted">
          We remove the names, email addresses and phone numbers we can find before ranking or
          AI review. We can miss some, especially unusual name formats.
        </p>
        <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm text-foreground">
          {candidate.anonymized_text}
        </pre>
      </Card>
    </div>
  );
}
