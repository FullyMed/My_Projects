"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Badge, Button, Card, EmptyState, ErrorText, Input, Spinner } from "@/components/ui";

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

type BulkResult = { filename: string; status: "ok" | "error"; detail?: string };

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [offset, setOffset] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);

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
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    setBulkResults(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const single = files.length === 1;
      const formData = new FormData();
      for (const f of files) formData.append(single ? "file" : "files", f);
      if (category) formData.append("category", category);

      const path = single ? "/candidates/upload" : "/candidates/upload/bulk";
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (!single) {
        setBulkResults((await response.json()) as BulkResult[]);
      }
      setFiles([]);
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
              multiple
              className="hidden"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              required
            />
            <span className="text-sm font-medium text-foreground">
              {files.length === 0
                ? "Click to choose resume PDF(s)"
                : files.length === 1
                  ? files[0].name
                  : `${files.length} files selected`}
            </span>
            <span className="text-xs text-muted">PDF, up to 10MB each — select several to bulk-upload</span>
          </label>
          <Input
            placeholder="Category (optional)"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <Button type="submit" loading={uploading} disabled={files.length === 0} className="w-fit">
            {uploading
              ? "Uploading..."
              : files.length > 1
                ? `Upload ${files.length} resumes`
                : "Upload resume"}
          </Button>
        </form>

        {bulkResults && (
          <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3 text-sm">
            {bulkResults.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={r.status === "ok" ? "text-accent" : "text-danger"}>
                  {r.status === "ok" ? "✓" : "✗"}
                </span>
                <span className="text-foreground">{r.filename}</span>
                {r.detail && <span className="text-xs text-muted">— {r.detail}</span>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {error && <ErrorText>{error}</ErrorText>}

      {loadingList ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6 text-muted" />
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
