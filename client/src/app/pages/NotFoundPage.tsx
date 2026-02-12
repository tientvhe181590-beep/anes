import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        The page you are looking for does not exist.
      </p>
      <Link className="mt-4 inline-block text-[var(--accent)]" to="/landing">
        Go to landing
      </Link>
    </main>
  );
}
