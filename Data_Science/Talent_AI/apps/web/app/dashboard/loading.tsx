import { Spinner } from "@/components/ui";

// Next.js route-segment loading UI: shown while this segment's page is being
// rendered on the server (candidates/[id] and jobs/[id] are dynamic --
// server-rendered per request, not pre-built) and before the page's own
// client-side JS has mounted. Deliberately identical markup to
// dashboard/layout.tsx's own `!ready` (auth-check) loading state, so there's
// no visual jump between "route loading" and "layout mounted, checking
// auth" -- from the user's point of view it should read as one continuous
// spinner, not two different loading moments.
export default function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Spinner className="h-6 w-6 text-muted" />
    </main>
  );
}
