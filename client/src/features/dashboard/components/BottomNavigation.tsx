import { Home, Activity, Utensils, User, MessageSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function BottomNavigation() {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between rounded-t-2xl border-t border-[var(--border)] bg-[var(--surface-elevated)] px-4 pt-4 pb-8 backdrop-blur-md">
      <NavItem to="/dashboard" icon={<Home size={24} />} label="Home" />
      <NavItem to="/workouts" icon={<Activity size={24} />} label="Workouts" />
      <NavItem to="/nutrition" icon={<Utensils size={24} />} label="Nutrition" />
      <NavItem to="/chat" icon={<MessageSquare size={24} />} label="Chat AI" />
      <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 transition-colors hover:text-[var(--accent)] ${
          isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}
