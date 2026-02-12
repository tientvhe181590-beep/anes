import { NavLink } from 'react-router';

const items = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Workouts', to: '/workouts' },
  { label: 'Nutrition', to: '/nutrition' },
  { label: 'Chat', to: '/chat' },
  { label: 'Profile', to: '/profile' },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'text-xs font-semibold text-[var(--accent)]'
                : 'text-xs text-[var(--text-muted)]'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
