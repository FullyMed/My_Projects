"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";

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
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Rank candidates against a job description</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded border p-4">
        <input
          className="rounded border px-3 py-2"
          placeholder="Job title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <textarea
          className="min-h-40 rounded border px-3 py-2"
          placeholder="Paste the job description here"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {submitting ? "Ranking..." : "Rank candidates"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {results && (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Rank</th>
              <th className="py-2">Score</th>
              <th className="py-2">Category</th>
              <th className="py-2">Skills</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.candidate_id} className="border-b">
                <td className="py-2">{result.rank}</td>
                <td className="py-2">{result.score.toFixed(3)}</td>
                <td className="py-2">{result.category ?? "—"}</td>
                <td className="py-2">{result.skills.slice(0, 5).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {results && results.length === 0 && (
        <p className="text-gray-500">No candidates to rank yet — upload some resumes first.</p>
      )}
    </div>
  );
}
