import { create } from 'zustand';
import { KnotState, KnotDefinition } from '../types/knot';
import Cookies from 'js-cookie';

const COOKIE_KEY = 'topology_knots';

const loadKnotsFromCookies = (): KnotDefinition[] => {
  const savedKnots = Cookies.get(COOKIE_KEY);
  if (savedKnots) {
    try {
      return JSON.parse(savedKnots);
    } catch (e) {
      console.error('Error parsing knots from cookies:', e);
    }
  }
  return defaultKnots;
};

const saveKnotsToCookies = (knots: KnotDefinition[]) => {
  Cookies.set(COOKIE_KEY, JSON.stringify(knots), { expires: 365 });
};

const defaultKnots: KnotDefinition[] = [
  {
    id: 'trefoil',
    name: 'Trefoil Knot',
    description: 'The simplest non-trivial knot',
    lastModified: Date.now(),
    code: `function generatePoints(t) {
  const x = Math.sin(t) + 2 * Math.sin(2 * t);
  const y = Math.cos(t) - 2 * Math.cos(2 * t);
  const z = -Math.sin(3 * t);
  return [x, y, z];
}`
  },
  {
    id: 'figure-eight',
    name: 'Figure-Eight Knot',
    description: 'A knot with crossing number 4',
    lastModified: Date.now(),
    code: `function generatePoints(t) {
  const x = (2 + Math.cos(2 * t)) * Math.cos(3 * t);
  const y = (2 + Math.cos(2 * t)) * Math.sin(3 * t);
  const z = Math.sin(4 * t);
  return [x, y, z];
}`
  }
];

export const useKnotStore = create<KnotState>((set) => ({
  knots: loadKnotsFromCookies(),
  selectedKnot: null,
  isMenuOpen: false,
  addKnot: (knot) => set((state) => {
    const newKnots = [...state.knots, knot];
    saveKnotsToCookies(newKnots);
    return { knots: newKnots, selectedKnot: knot.id };
  }),
  selectKnot: (id) => set({ selectedKnot: id }),
  updateKnot: (id, updates) => set((state) => {
    const newKnots = state.knots.map(knot =>
      knot.id === id ? { ...knot, ...updates, lastModified: Date.now() } : knot
    );
    saveKnotsToCookies(newKnots);
    return { knots: newKnots };
  }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  deleteKnot: (id) => set((state) => {
    const newKnots = state.knots.filter(knot => knot.id !== id);
    saveKnotsToCookies(newKnots);
    return { 
      knots: newKnots,
      selectedKnot: state.selectedKnot === id ? null : state.selectedKnot
    };
  })
}));
