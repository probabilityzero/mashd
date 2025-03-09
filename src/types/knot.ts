export interface KnotDefinition {
  id: string;
  name: string;
  description: string;
  code: string;
  lastModified: number;
}

export interface KnotState {
  knots: KnotDefinition[];
  selectedKnot: string | null;
  isMenuOpen: boolean;
  addKnot: (knot: KnotDefinition) => void;
  selectKnot: (id: string) => void;
  updateKnot: (id: string, updates: Partial<KnotDefinition>) => void;
  toggleMenu: () => void;
  deleteKnot: (id: string) => void;
}
