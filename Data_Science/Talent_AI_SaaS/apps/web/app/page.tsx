export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">Talent AI</h1>
      <p className="max-w-md text-center text-gray-600">
        Rank candidates against a job description with semantic search.
      </p>
      <div className="flex gap-4">
        <a href="/signup" className="rounded bg-black px-4 py-2 text-white">
          Sign up
        </a>
        <a href="/login" className="rounded border px-4 py-2">
          Log in
        </a>
      </div>
    </main>
  );
}
