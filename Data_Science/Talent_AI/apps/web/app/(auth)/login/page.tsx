"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import { Button, Card, ErrorText, Field, Input, Logo } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError(friendlyAuthError(signInError, "log in"));
      return;
    }
    router.push("/dashboard/candidates");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6">
      <a href="/" className="rounded-md" aria-label="Talent AI home">
        <Logo />
      </a>
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-lg font-semibold">Log in</h1>
          <p className="text-sm text-muted">Good to see you again.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Work email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" loading={loading} className="mt-1 w-full">
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </Card>
      <p className="text-sm text-muted">
        No account yet?{" "}
        <a className="font-medium text-accent hover:text-accent-hover" href="/signup">
          Sign up
        </a>
      </p>
    </main>
  );
}
