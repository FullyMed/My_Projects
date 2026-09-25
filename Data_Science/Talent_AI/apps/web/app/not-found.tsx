import type { Metadata } from "next";
import { Logo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found — Talent AI",
};

// Root-level not-found.tsx doubles as this app's global 404: Next.js
// renders it for any unmatched URL, not just an explicit notFound() call.
// It sits inside the root layout (app/layout.tsx), so it automatically
// picks up globals.css's light/dark theming -- no separate styling needed.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <Logo className="text-lg" />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="max-w-md text-3xl font-semibold tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="max-w-sm text-muted">
          The link might be broken, or the page may have moved. Let&apos;s get you back on
          track.
        </p>
      </div>
      <a
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        Go home
      </a>
    </main>
  );
}
