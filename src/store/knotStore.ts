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
    description: 'The non-trivial knot, defined by a smooth parametric curve.',
    lastModified: Date.now(),
    code: `function generatePoints(t) {
  // Trefoil Knot parametric equations
  const x = Math.sin(t) + 2 * Math.sin(2 * t);
  const y = Math.cos(t) - 2 * Math.cos(2 * t);
  const z = -Math.sin(3 * t);
  return [x, y, z];
}`
  },
  {
    id: 'figureEight',
    name: 'Figure-Eight Knot',
    description: 'A knot with a self-intersecting pattern in its projection.',
    lastModified: Date.now(),
    code: `function generatePoints(t) {
  // Figure-Eight Knot parametric equations
  const x = (2 + Math.cos(2 * t)) * Math.cos(3 * t);
  const y = (2 + Math.cos(2 * t)) * Math.sin(3 * t);
  const z = Math.sin(4 * t);
  return [x, y, z];
}`
  },
  {
    id: 'lemniscate',
    name: 'Lemniscate of Bernoulli',
    description: 'A figure-eight curve. (z is set to 0)',
    lastModified: Date.now(),
    code: `function generatePoints(t) {
  // Lemniscate parametric equations in 2D, with z fixed to 0.
  // Using an adjusted version to avoid sqrt issues: 
  // r = a * sqrt(|cos(2*t)|)
  const a = 5;
  const r = a * Math.sqrt(Math.abs(Math.cos(2 * t)));
  const x = r * Math.cos(t);
  const y = r * Math.sin(t);
  const z = 0;
  return [x, y, z];
}`
  },
  {
    id: 'mobius',
    name: 'Möbius Slice',
    description: 'A 1D slice of a Möbius strip that approximates a twisting loop in 3D.',
    lastModified: Date.now(),
    code: `function generatePoints(t) {
  // Approximating a Möbius strip curve with a twist along the circle.
  // Here, t ranges from 0 to 2π.
  const scale = 0;
  const R = 5;      // Radius of the central circle
  const twist = Math.sin(3 * t) * 0.5;  // Variation to simulate the half-twist
  const x = (R + twist * Math.cos(t / 2)) * Math.cos(t);
  const y = (R + twist * Math.cos(t / 2)) * Math.sin(t);
  const z = twist * Math.sin(t / 2);
  return [x, y, z];
}`
  },
  {
    id: 'sineCurve2D',
    name: 'Sine Wave',
    description: 'A sine wave plotted as a curve. (z is set to 0)',
    lastModified: Date.now(),
    code: `function generatePoints(t) {
  // t ranges from 0 to 2π, mapping to x.
  const scale = 3.1;
  const x = scale * t;
  const y = scale * Math.sin(t);
  const z = 0;
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
