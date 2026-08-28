"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Badge, Button, Card, ErrorText, Spinner } from "@/components/ui";

type CandidateDetail = {
  id: string;
  source_path: string;
  category: string | null;
  raw_text: string;
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

  useEffect(() => {
    apiFetch<CandidateDetail>(`/candidates/${id}`)
      .then(setCandidate)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleViewResume() {
    setResumeLoading(true);
    try {
      const { url } = await apiFetch<{ url: string }>(`/candidates/${id}/resume-url`);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(String(err));
    } finally {
      setResumeLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this candidate? This can't be undone.")) return;
    setDeleting(true);
    try {
      await apiFetch(`/candidates/${id}`, { method: "DELETE" });
      router.push("/dashboard/candidates");
    } catch (err) {
      setError(String(err));
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
    return <ErrorText>{error ?? "Candidate not found."}</ErrorText>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <a href="/dashboard/candidates" className="text-sm text-muted hover:text-foreground">
            ← Back to candidates
          </a>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {candidate.category ?? "Uncategorized candidate"}
          </h1>
          <p className="text-sm text-muted">
            Uploaded {new Date(candidate.created_at).toLocaleString()}
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
            <span className="text-sm text-muted">None detected</span>
          )}
        </div>
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
          <span className="text-sm text-muted">None detected</span>
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
          <span className="text-sm text-muted">None detected</span>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-medium text-muted">
          Anonymized resume text
          <span className="ml-2 font-normal text-muted/70">
            (PII stripped — this is what matching runs against)
          </span>
        </h2>
        <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm text-foreground">
          {candidate.anonymized_text}
        </pre>
      </Card>
    </div>
  );
}
