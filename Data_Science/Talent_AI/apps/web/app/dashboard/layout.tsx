"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo, Spinner } from "@/components/ui";

const navItems = [
  { href: "/dashboard/candidates", label: "Candidates" },
  { href: "/dashboard/jobs", label: "Jobs" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
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
