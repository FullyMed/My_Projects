"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";
import { Logo, Spinner } from "@/components/ui";

const navItems = [
  { href: "/dashboard/candidates", label: "Candidates" },
  { href: "/dashboard/jobs", label: "Jobs" },
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="flex gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {usage && (
              <div
                className="hidden flex-col gap-0.5 sm:flex"
                title={`${usage.tokens_used.toLocaleString()} / ${usage.token_limit.toLocaleString()} AI tokens used this month (${usage.plan} plan)`}
              >
                <span className="text-xs text-muted">
                  {usage.tokens_used.toLocaleString()} / {usage.token_limit.toLocaleString()} AI tokens
                </span>
                <div className="h-1 w-32 overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className={`h-full rounded-full ${
                      usage.tokens_used >= usage.token_limit ? "bg-danger" : "bg-accent"
                    }`}
                    style={{
                      width: `${Math.min(100, (usage.tokens_used / usage.token_limit) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <span className="text-muted">{email}</span>
            <button
              onClick={handleSignOut}
              className="font-medium text-muted transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
