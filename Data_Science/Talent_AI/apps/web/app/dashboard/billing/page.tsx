"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button, Card, ErrorText, Spinner } from "@/components/ui";

type UsageSummary = {
  plan: string;
  tokens_used: number;
  token_limit: number;
  tokens_remaining: number;
  period_start: string;
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");

  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<UsageSummary>("/usage")
      .then(setUsage)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade() {
    setRedirecting("checkout");
    setError(null);
    try {
      const { url } = await apiFetch<{ url: string }>("/billing/checkout", { method: "POST" });
      window.location.href = url;
    } catch (err) {
      setError(String(err));
      setRedirecting(null);
    }
  }

  async function handleManageBilling() {
    setRedirecting("portal");
    setError(null);
    try {
      const { url } = await apiFetch<{ url: string }>("/billing/portal", { method: "POST" });
      window.location.href = url;
    } catch (err) {
      setError(String(err));
      setRedirecting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-muted" />
      </div>
    );
  }

  const isPro = usage?.plan === "pro";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted">Manage your plan and AI usage.</p>
      </div>

      {checkoutResult === "success" && (
        <Card className="border-accent/30 bg-accent/5 p-4">
          <p className="text-sm text-foreground">
            Subscription started — it may take a few seconds to reflect below.
          </p>
        </Card>
      )}
      {checkoutResult === "cancel" && (
        <Card className="p-4">
          <p className="text-sm text-muted">Checkout was cancelled — no charge was made.</p>
        </Card>
      )}
      {error && <ErrorText>{error}</ErrorText>}

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-muted">Current plan</h2>
            <p className="mt-1 text-lg font-semibold capitalize">{usage?.plan ?? "trial"}</p>
          </div>
          {isPro ? (
            <Button variant="secondary" loading={redirecting === "portal"} onClick={handleManageBilling}>
              Manage billing
            </Button>
          ) : (
            <Button loading={redirecting === "checkout"} onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
          )}
        </div>

        {usage && (
          <div className="mt-5 flex flex-col gap-1.5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">AI insights usage this month</span>
              <span className="text-muted">
                {usage.tokens_used.toLocaleString()} / {usage.token_limit.toLocaleString()} tokens
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
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
      </Card>

      {!isPro && (
        <Card className="p-5">
          <h2 className="mb-2 text-sm font-medium text-muted">Trial plan limits</h2>
          <ul className="list-disc pl-5 text-sm text-muted marker:text-muted">
            <li>10 candidates</li>
            <li>3 job descriptions</li>
            <li>{usage?.token_limit.toLocaleString() ?? "200,000"} AI insight tokens / month</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
