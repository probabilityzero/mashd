import { create } from 'zustand';
import Cookies from 'js-cookie';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>((set) => ({
  isDark: Cookies.get('theme') === 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = !state.isDark;
      Cookies.set('theme', newTheme ? 'dark' : 'light');
      return { isDark: newTheme };
    }),
}));
