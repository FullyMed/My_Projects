"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

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
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCandidates() {
    const data = await apiFetch<Candidate[]>("/candidates");
    setCandidates(data);
  }

  useEffect(() => {
    loadCandidates().catch((err) => setError(String(err)));
  }, []);

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
      await loadCandidates();
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Candidates</h1>

      <form onSubmit={handleUpload} className="flex flex-col gap-3 rounded border p-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          required
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Category (optional)"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-fit rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload resume"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Category</th>
            <th className="py-2">Skills</th>
            <th className="py-2">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="border-b">
              <td className="py-2">{candidate.category ?? "—"}</td>
              <td className="py-2">{candidate.skills.slice(0, 5).join(", ") || "—"}</td>
              <td className="py-2">{new Date(candidate.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {candidates.length === 0 && <p className="text-gray-500">No candidates uploaded yet.</p>}
    </div>
  );
}
