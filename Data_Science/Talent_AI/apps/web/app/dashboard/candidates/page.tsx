"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Badge, Button, Card, EmptyState, ErrorText, Input } from "@/components/ui";

const PAGE_SIZE = 20;

type Candidate = {
  id: string;
  source_path: string;
  category: string | null;
  skills: string[];
  education: string[];
  experience: string[];
  created_at: string;
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [offset, setOffset] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCandidates(atOffset: number) {
    setLoadingList(true);
    try {
      const data = await apiFetch<Candidate[]>(
        `/candidates?limit=${PAGE_SIZE}&offset=${atOffset}`,
      );
      setCandidates(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadCandidates(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append("file", file);
      if (category) formData.append("category", category);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }

      setFile(null);
      setCategory("");
      setOffset(0);
      await loadCandidates(0);
    } catch (err) {
      const msg = String(err);
      setError(
        msg.includes("402")
          ? "Trial plan is limited to 10 candidates. Upgrade to add more."
          : msg,
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Candidates</h1>
        <p className="text-sm text-muted">Resumes parsed, anonymized, and ready to rank.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-accent hover:bg-surface-hover">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
            <span className="text-sm font-medium text-foreground">
              {file ? file.name : "Click to choose a resume PDF"}
            </span>
            <span className="text-xs text-muted">PDF, up to a few MB</span>
          </label>
          <Input
            placeholder="Category (optional)"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <Button type="submit" loading={uploading} disabled={!file} className="w-fit">
            {uploading ? "Uploading..." : "Upload resume"}
          </Button>
        </form>
      </Card>

      {error && <ErrorText>{error}</ErrorText>}

      {loadingList ? (
        <div className="flex justify-center py-12">
          <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
        </div>
      ) : candidates.length === 0 && offset === 0 ? (
        <EmptyState
          title="No candidates yet"
          description="Upload a resume above to get started."
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Skills</th>
                  <th className="px-4 py-3 font-medium">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-border last:border-0">
                    <td className="px-0 py-0">
                      <a
                        href={`/dashboard/candidates/${candidate.id}`}
                        className="block px-4 py-3 hover:text-accent"
                      >
                        {candidate.category ?? "—"}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                        {candidate.skills.length === 0 && <span className="text-muted">—</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {new Date(candidate.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
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
              disabled={candidates.length < PAGE_SIZE}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
