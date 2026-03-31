import { create } from 'zustand';

interface AppState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
