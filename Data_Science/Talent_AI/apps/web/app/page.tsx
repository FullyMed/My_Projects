import { Badge, Logo } from "@/components/ui";

// An illustration of a ranking, so a visitor sees what the product produces
// before signing up. It's labeled as an example, and the numbers are made
// up, so keep them plausible (match scores rarely pass the high 80s).
const EXAMPLE_RANKING = [
  { rank: 1, category: "Engineering", score: 81.2, skills: ["python", "aws", "docker"] },
  { rank: 2, category: "Data Science", score: 64.8, skills: ["python", "sql"] },
  { rank: 3, category: "Finance", score: 22.1, skills: [] },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16 sm:px-6">
      <Logo className="text-lg" />
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
          See which candidates fit the job
        </h1>
        <p className="max-w-md text-muted">
          Upload resumes and paste a job description. Talent AI compares meaning rather than
          exact words, so &quot;led a team of five&quot; can count toward a role that asks for
          management.
        </p>
      </div>
      <div className="flex gap-3">
        <a
          href="/signup"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[background-color,transform] duration-150 ease-snappy hover:bg-accent-hover motion-safe:active:scale-[0.97]"
        >
          Sign up
        </a>
        <a
          href="/login"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium transition-[background-color,transform] duration-150 ease-snappy hover:bg-surface-hover motion-safe:active:scale-[0.97]"
        >
          Log in
        </a>
      </div>

      <figure className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium">Backend Engineer</p>
          <ol className="flex flex-col gap-3">
            {EXAMPLE_RANKING.map((row) => (
              <li key={row.rank} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                  {row.rank}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{row.category}</span>
                    <span className="text-xs text-muted tabular-nums">{row.score}% match</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${row.score}%` }} />
                  </div>
                  {row.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {row.skills.map((skill) => (
                        <Badge key={skill} tone="accent">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <figcaption className="mt-2 text-center text-xs text-muted">
          An example ranking. Highlighted skills match the job.
        </figcaption>
      </figure>

      <nav aria-label="Legal" className="flex gap-4 text-xs text-muted">
        <a href="/terms" className="rounded-sm hover:text-foreground">
          Terms of Use
        </a>
        <a href="/privacy" className="rounded-sm hover:text-foreground">
          Privacy Policy
        </a>
      </nav>
    </main>
  );
}
