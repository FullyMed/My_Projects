"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

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
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <nav className="flex gap-4 text-sm font-medium">
          <a href="/dashboard/candidates" className="hover:underline">
            Candidates
          </a>
          <a href="/dashboard/jobs" className="hover:underline">
            Jobs
          </a>
        </nav>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{email}</span>
          <button onClick={handleSignOut} className="underline">
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-6">{children}</main>
    </div>
  );
}
