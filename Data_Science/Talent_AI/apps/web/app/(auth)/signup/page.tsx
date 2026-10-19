"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import { Button, Card, ErrorText, Field, Input, Logo } from "@/components/ui";

export default function SignupPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    // tenant_name flows into raw_user_meta_data, consumed by the
    // private.handle_new_user trigger to create the tenants + profiles rows.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { tenant_name: companyName } },
    });

    setLoading(false);
    if (signUpError) {
      setError(friendlyAuthError(signUpError, "sign up"));
      return;
    }
    // With email confirmation on (as in production), signUp returns no
    // session -- sending the user to the dashboard would just bounce them to
    // /login with no explanation. Tell them to confirm first instead.
    if (!data.session) {
      setAwaitingConfirmation(true);
      return;
    }
    router.push("/dashboard/candidates");
  }

  if (awaitingConfirmation) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6">
        <a href="/" className="rounded-md" aria-label="Talent AI home">
          <Logo />
        </a>
        <Card className="reveal w-full max-w-sm p-6">
          <div role="status" className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">Check your email</h1>
            <p className="text-sm text-muted">
              We sent a confirmation link to <span className="text-foreground">{email}</span>.
              Click it to finish setting up your account, then log in.
            </p>
          </div>
        </Card>
        <p className="text-sm text-muted">
          Already confirmed?{" "}
          <a className="font-medium text-accent hover:text-accent-hover" href="/login">
            Log in
          </a>
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6">
      <a href="/" className="rounded-md" aria-label="Talent AI home">
        <Logo />
      </a>
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-lg font-semibold">Create your company account</h1>
          <p className="text-sm text-muted">
            You start on the free Trial plan: up to 10 candidates and 3 jobs.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Company name" htmlFor="signup-company">
            <Input
              id="signup-company"
              autoComplete="organization"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
          </Field>
          <Field label="Work email" htmlFor="signup-email">
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="signup-password" hint="At least 8 characters.">
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </Field>
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" loading={loading} className="mt-1 w-full">
            {loading ? "Creating account..." : "Sign up"}
          </Button>
          <p className="text-center text-xs text-muted">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-accent hover:text-accent-hover">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-accent hover:text-accent-hover">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </Card>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <a className="font-medium text-accent hover:text-accent-hover" href="/login">
          Log in
        </a>
      </p>
    </main>
  );
}
