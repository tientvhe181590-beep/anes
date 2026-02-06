import { create } from 'zustand';

/**
 * Root Zustand store for ephemeral client-side UI state.
 * Domain data belongs in RxDB, NOT here.
 */
interface AppState {
  /** Whether the mobile sidebar/nav is open */
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
