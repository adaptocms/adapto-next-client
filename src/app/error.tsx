"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container">
      <h1 className="page-title">Something went wrong</h1>
      <p>Something broke on our end. Try again in a moment.</p>
      <p>
        <button onClick={reset}>Try again</button>
      </p>
    </main>
  );
}
