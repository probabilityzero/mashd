import { create } from 'zustand';

type ThemeStore = {
  isDark: boolean;
  toggleTheme: () => void;
  setThemeBasedOnSystem: (isDarkMode: boolean) => void;
};

export const useTheme = create<ThemeStore>((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  setThemeBasedOnSystem: (isDarkMode: boolean) => set({ isDark: isDarkMode })
}));