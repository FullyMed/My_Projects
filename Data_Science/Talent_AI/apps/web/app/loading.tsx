import { Spinner } from "@/components/ui";

// Root-level route loading UI -- covers "/", "/login", "/signup" while
// their route is being rendered/streamed, before any page content or
// client JS has taken over. See app/dashboard/loading.tsx for the
// dashboard-specific one (same markup, kept as two files since they sit in
// different route segments).
export default function RootLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Spinner className="h-6 w-6 text-muted" />
    </main>
  );
}
