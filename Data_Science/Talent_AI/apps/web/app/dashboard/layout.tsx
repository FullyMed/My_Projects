"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";
import { Button, Logo, Spinner } from "@/components/ui";

const navItems = [
  { href: "/dashboard/candidates", label: "Candidates" },
  { href: "/dashboard/jobs", label: "Jobs" },
  { href: "/dashboard/billing", label: "Billing" },
];

type UsageSummary = {
  plan: string;
  tokens_used: number;
  token_limit: number;
  tokens_remaining: number;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setEmail(session.user.email ?? null);
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    apiFetch<UsageSummary>("/usage").then(setUsage).catch(() => setUsage(null));
  }, [ready]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6 text-muted" />
      </main>
    );
  }

  const usedPercent = usage
    ? Math.min(100, Math.round((usage.tokens_used / usage.token_limit) * 100))
    : 0;

  // Two rows so nothing has to squeeze: brand and account on top, the page
  // tabs and the AI-use meter underneath. One row overflowed a phone screen
  // and wrapped "Talent AI" and "Log out" even on desktop.
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to main content
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 pt-4 sm:px-6">
          <a href="/dashboard/candidates" className="rounded-md" aria-label="Talent AI, go to Candidates">
            <Logo />
          </a>
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="hidden truncate text-muted sm:block" title={email ?? undefined}>
              {email}
            </span>
            <Button variant="ghost" onClick={handleSignOut} className="px-3">
              Log out
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-3xl items-end justify-between gap-4 px-4 sm:px-6">
          <nav aria-label="Main" className="-mb-px flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              // Prefix match, so a job's own page still highlights Jobs.
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
          {usage && (
            <a
              href="/dashboard/billing"
              className="mb-2.5 hidden shrink-0 flex-col gap-1 rounded-md sm:flex"
              title={`You've used ${usage.tokens_used.toLocaleString()} of your ${usage.token_limit.toLocaleString()} AI tokens this month. The count resets on the 1st.`}
            >
              <span className="text-xs text-muted tabular-nums">
                AI use this month: {usedPercent}%
              </span>
              <span className="block h-1 w-36 overflow-hidden rounded-full bg-surface-hover">
                <span
                  className={`block h-full rounded-full ${
                    usage.tokens_used >= usage.token_limit ? "bg-danger" : "bg-accent"
                  }`}
                  style={{ width: `${usedPercent}%` }}
                />
              </span>
            </a>
          )}
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 outline-none sm:px-6">
        {children}
      </main>
    </div>
  );
}
