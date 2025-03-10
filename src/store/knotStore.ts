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
    description: 'The simplest non-trivial 3D knot, defined by a smooth parametric curve.',
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
    description: 'A popular 3D knot with a self-intersecting pattern in its projection.',
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
    description: 'A classic 2D figure-eight curve defined in polar coordinates.',
    lastModified: Date.now(),
    code: `function generatePoints(t) {
  // Lemniscate parametric equations for a 2D figure-eight curve
  const a = 5; // scale factor
  // Using a common parametrization: r^2 = a^2 cos(2t)
  // r = a * Math.sqrt(Math.cos(2*t)) (only valid when cos(2*t) >= 0)
  const cos2t = Math.cos(2 * t);
  if (cos2t < 0) return [null, null]; // skip undefined points
  const r = a * Math.sqrt(cos2t);
  const x = r * Math.cos(t);
  const y = r * Math.sin(t);
  return [x, y];
}`
  },
  {
    id: 'mobius',
    name: 'Möbius Strip',
    description: 'A non-orientable 3D surface with only one side and one boundary.',
    lastModified: Date.now(),
    code: `function generatePoints(u, v) {
  // u: angle around the circle (0 to 2π)
  // v: position across the width (-1 to 1)
  const R = 5; // radius of the center circle
  const x = (R + v * Math.cos(u / 2)) * Math.cos(u);
  const y = (R + v * Math.cos(u / 2)) * Math.sin(u);
  const z = v * Math.sin(u / 2);
  return [x, y, z];
}`
  },
  {
    id: 'kleinBottle',
    name: 'Klein Bottle',
    description: 'A famous non-orientable surface that cannot be embedded in 3D without self-intersections.',
    lastModified: Date.now(),
    code: `function generatePoints(u, v) {
  // u and v vary from 0 to 1, then scaled to 0 to 2π
  u = u * 2 * Math.PI;
  v = v * 2 * Math.PI;
  let x, y, z;
  if (u < Math.PI) {
    x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
    y = 3 * Math.sin(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.sin(u) * Math.cos(v);
  } else {
    x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
    y = 3 * Math.sin(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.sin(v + Math.PI);
  }
  z = (2 * (1 - Math.cos(u) / 2)) * Math.sin(v);
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
