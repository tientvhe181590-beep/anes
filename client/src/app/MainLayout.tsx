import { Outlet } from "react-router";
import { BottomNav } from "@/shared/components/BottomNav";

export function MainLayout() {
  return (
    <div className="min-h-screen pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
