import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './features/dashboard/components/BottomNavigation';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="flex-1 pb-24">
        {' '}
        {/* Add padding bottom to avoid overlap with nav */}
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  );
}
