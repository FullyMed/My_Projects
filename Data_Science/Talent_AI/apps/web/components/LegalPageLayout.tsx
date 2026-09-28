import type { ReactNode } from "react";
import { Logo } from "./ui";

/** Shared nav/footer chrome + prose styling for standalone legal pages
 * (Terms, Privacy). Public route, outside the dashboard -- works whether
 * the visitor is signed in or not, so it doesn't read auth state. Content
 * is plain semantic HTML (h2/p/ul/strong) passed as children; this file
 * only owns layout and typography. */
export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <a href="/">
            <Logo />
          </a>
          <a href="/" className="text-sm text-muted hover:text-foreground">
            ← Back to home
          </a>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mb-10 mt-1 text-sm text-muted">Last updated: {lastUpdated}</p>

        <div
          className="flex flex-col gap-8 text-sm leading-relaxed text-muted
            [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground
            [&_p]:mb-2 [&_p:last-child]:mb-0
            [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5
            [&_li]:leading-relaxed
            [&_a]:text-accent [&_a]:hover:text-accent-hover
            [&_strong]:font-medium [&_strong]:text-foreground"
        >
          {children}
        </div>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted sm:flex-row">
          <Logo className="text-sm" />
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-foreground">
              Terms of Use
            </a>
            <a href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
