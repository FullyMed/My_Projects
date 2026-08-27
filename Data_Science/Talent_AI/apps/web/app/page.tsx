import { Logo } from "@/components/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <Logo className="text-lg" />
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="max-w-md text-3xl font-semibold tracking-tight">
          Rank candidates against a job description
        </h1>
        <p className="max-w-sm text-muted">
          Upload resumes, paste a job description, and get a ranked shortlist by semantic
          similarity — not keyword matching.
        </p>
      </div>
      <div className="flex gap-3">
        <a
          href="/signup"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          Sign up
        </a>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-hover"
        >
          Log in
        </a>
      </div>
    </main>
  );
}
