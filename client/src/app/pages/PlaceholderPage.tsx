interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        This section is coming soon.
      </p>
    </main>
  );
}
