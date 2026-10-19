"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { apiFetch, errorMessage, toApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Badge, Button, Card, EmptyState, ErrorText, Field, Input, Spinner } from "@/components/ui";

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
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropped files skip the input's accept= filter, so check them here.
  function pickFiles(list: FileList | null) {
    const picked = Array.from(list ?? []);
    const pdfs = picked.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    setError(pdfs.length < picked.length ? "Only PDF files can be uploaded, so we left the others out." : null);
    setFiles(pdfs);
  }

  async function loadCandidates(atOffset: number) {
    setLoadingList(true);
    try {
      const data = await apiFetch<Candidate[]>(
        `/candidates?limit=${PAGE_SIZE}&offset=${atOffset}`,
      );
      setCandidates(data);
    } catch (err) {
      setError(errorMessage(err));
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
        throw await toApiError(response);
      }

      if (!single) {
        setBulkResults((await response.json()) as BulkResult[]);
      }
      setFiles([]);
      // Clear the native input too, or choosing the same file again fires no change event.
      if (fileInputRef.current) fileInputRef.current.value = "";
      setCategory("");
      setOffset(0);
      await loadCandidates(0);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Candidates</h1>
        <p className="text-sm text-muted">Upload resumes here, then rank them against any of your jobs.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          {/* The input stays in the page (sr-only, not display:none) so it can
              take keyboard focus; the label around it shows the focus ring. */}
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              pickFiles(event.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-8 text-center transition-colors focus-within:border-accent focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent hover:border-accent hover:bg-surface-hover ${
              dragging ? "border-accent bg-accent/5" : "border-border-strong"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="sr-only"
              onChange={(event) => pickFiles(event.target.files)}
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="mb-1 h-6 w-6 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 16V4m0 0-4 4m4-4 4 4" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            <span className="max-w-full truncate text-sm font-medium text-foreground">
              {files.length === 0
                ? "Choose resume PDFs, or drop them here"
                : files.length === 1
                  ? files[0].name
                  : `${files.length} files selected`}
            </span>
            <span className="text-xs text-muted">PDF files up to 10 MB each. You can pick several at once.</span>
          </label>
          <Field label="Category (optional)" htmlFor="candidate-category" hint="Shown in place of the candidate's name, e.g. Engineering.">
            <Input
              id="candidate-category"
              placeholder="Engineering"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </Field>
          <Button type="submit" loading={uploading} disabled={files.length === 0} className="w-fit">
            {uploading
              ? "Uploading..."
              : files.length > 1
                ? `Upload ${files.length} resumes`
                : "Upload resume"}
          </Button>
        </form>

        {bulkResults && (
          <ul className="reveal mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            {bulkResults.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className={`mt-0.5 h-4 w-4 shrink-0 ${r.status === "ok" ? "text-success" : "text-danger"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {r.status === "ok" ? <path d="m5 10.5 3.5 3.5L15 6.5" /> : <path d="m6 6 8 8m0-8-8 8" />}
                </svg>
                <span className="min-w-0">
                  <span className="sr-only">{r.status === "ok" ? "Uploaded: " : "Not uploaded: "}</span>
                  <span className="break-all text-foreground">{r.filename}</span>
                  {r.detail && <span className="block text-xs text-muted">{r.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
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
          description="Upload a resume above and it will show up here."
        />
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 font-medium">Skills</th>
                  <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface-hover"
                  >
                    <td className="px-0 py-0 align-top">
                      <a
                        href={`/dashboard/candidates/${candidate.id}`}
                        className="block min-w-32 px-4 py-3 font-medium hover:text-accent"
                      >
                        {candidate.category ?? "Uncategorized"}
                      </a>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                        {candidate.skills.length > 5 && (
                          <span className="px-1 text-xs text-muted">+{candidate.skills.length - 5} more</span>
                        )}
                        {candidate.skills.length === 0 && <span className="text-muted">None found</span>}
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 align-top text-muted tabular-nums sm:table-cell">
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          {/* Only worth showing once there's more than one page. */}
          {(offset > 0 || candidates.length === PAGE_SIZE) && (
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
          )}
        </>
      )}
    </div>
  );
}
