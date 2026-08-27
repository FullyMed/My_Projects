"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, ErrorText, Input, Logo } from "@/components/ui";

export default function SignupPage() {
  const [companyName, setCompanyName] = useState("");
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
    // tenant_name flows into raw_user_meta_data, consumed by the
    // private.handle_new_user trigger to create the tenants + profiles rows.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { tenant_name: companyName } },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    router.push("/dashboard/candidates");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <Logo />
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-lg font-semibold">Create your company account</h1>
          <p className="text-sm text-muted">Start ranking candidates in minutes.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Company name"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Work email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" loading={loading} className="mt-1 w-full">
            {loading ? "Creating account..." : "Sign up"}
          </Button>
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
