import { useNavigate } from 'react-router';
import { useAuthStore } from '@/app/store';
import { getFirebaseAuth } from '@/shared/lib/firebase';
import { getE2eAuthOverrides } from '@/shared/lib/e2e-auth';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  const navigate = useNavigate();
  const firebaseEnabled = useAuthStore((state) => state.firebaseEnabled);
  const logout = useAuthStore((state) => state.logout);
  const firebaseLogout = useAuthStore((state) => state.firebaseLogout);

  async function handleSignOut() {
    const e2e = getE2eAuthOverrides();
    if (e2e?.signOut) {
      await e2e.signOut();
      logout();
      navigate('/landing', { replace: true });
      return;
    }

    if (firebaseEnabled) {
      await firebaseLogout(getFirebaseAuth());
    } else {
      logout();
    }
    navigate('/landing', { replace: true });
  }

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-[var(--text-secondary)]">This section is coming soon.</p>
      {title === 'Profile' && (
        <button
          type="button"
          onClick={() => {
            void handleSignOut();
          }}
          className="mt-6 rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
        >
          Sign Out
        </button>
      )}
    </main>
  );
}
