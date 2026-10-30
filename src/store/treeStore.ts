import { create } from 'zustand';
import { Person, Relationship } from '../types';
import { apiFetch } from '../lib/firebase';

export interface TreeState {
  trees: { id: string; name: string; persons: number; lastUpdated: string }[];
  treeId: string | null;
  persons: Person[];
  relationships: Relationship[];
  selectedPersonId: string | null;
  sidePanelOpen: boolean;
  sidePanelTab: 'overview' | 'photos' | 'events' | 'edit';
  addPersonModalOpen: boolean;
  addPersonModalDefaults: (Partial<Person> & { relatedTo?: string; relType?: 'parent' | 'child' | 'spouse' | 'sibling' }) | null;
  pendingPositionUpdates: Record<string, { x: number; y: number }>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  filters: {
    generations: string[];
    lifeStages: string[];
    demographics: string[];
    locations: string[];
    birthMonths?: number[];
    vitalStatus?: string[];
  };
  viewMode: 'tree' | 'list' | 'map';
  filterPanelOpen: boolean;
  activityLog: { id: string; type: 'add' | 'update' | 'delete' | 'photo'; message: string; timestamp: string }[];

  fetchDashboardData: () => Promise<void>;
  fetchTreeData: (treeId: string) => Promise<void>;
  setTree: (treeId: string) => void;
  setViewMode: (mode: 'tree' | 'list' | 'map') => void;
  toggleFilterPanel: () => void;
  setPersons: (persons: Person[]) => void;
  setRelationships: (relationships: Relationship[]) => void;
  selectPerson: (personId: string | null) => void;
  closeSidePanel: () => void;
  setSidePanelTab: (tab: 'overview' | 'photos' | 'events' | 'edit') => void;
  openAddPersonModal: (defaults?: Partial<Person> & { relatedTo?: string; relType?: 'parent' | 'child' | 'spouse' | 'sibling' }) => void;
  closeAddPersonModal: () => void;
  updatePersonPosition: (personId: string, x: number, y: number) => void;
  flushPositionUpdates: () => Promise<void>;
  updatePersonLocally: (personId: string, data: Partial<Person>) => void;
  savePersonToDb: (personId: string) => Promise<void>;
  addPersonLocally: (person: Person) => Promise<void>;
  removePersonLocally: (personId: string) => Promise<void>;
  addRelationshipLocally: (rel: Relationship) => Promise<void>;
  removeRelationshipLocally: (relId: string) => Promise<void>;
  addTreeLocally: (tree: { id: string; name: string; persons: number; lastUpdated: string }) => Promise<void>;
  removeTreeLocally: (treeId: string) => Promise<void>;
  logActivity: (activity: Omit<{ id: string; type: 'add' | 'update' | 'delete' | 'photo'; message: string; timestamp: string }, 'id' | 'timestamp'>) => void;
  toggleFilter: (category: 'generations' | 'lifeStages' | 'demographics' | 'locations' | 'birthMonths' | 'vitalStatus', value: any) => void;
  clearFilters: () => void;
}

export const useTreeStore = create<TreeState>()((set, get) => ({
  trees: [],
  treeId: '1',
  persons: [],
  relationships: [],
  selectedPersonId: null,
  sidePanelOpen: false,
  sidePanelTab: 'overview',
  addPersonModalOpen: false,
  addPersonModalDefaults: null,
  pendingPositionUpdates: {},
  isLoading: false,
  isSaving: false,
  error: null,
  filters: {
    generations: [],
    lifeStages: [],
    demographics: [],
    locations: [],
    birthMonths: [],
    vitalStatus: [],
  },
  viewMode: 'tree',
  filterPanelOpen: true,
  activityLog: [],

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/trees');
      set({
        trees: data.trees || [],
        activityLog: data.activityLog || [],
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Failed to fetch dashboard data from Cloud SQL:', err);
      set({ isLoading: false, error: err.message || 'Failed to load trees' });
    }
  },

  fetchTreeData: async (treeId: string) => {
    set({ isLoading: true, error: null, treeId });
    try {
      const data = await apiFetch(`/api/trees/${treeId}`);
      set({
        persons: data.persons || [],
        relationships: data.relationships || [],
        activityLog: data.activityLog || get().activityLog,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Failed to fetch tree details from Cloud SQL:', err);
      set({ isLoading: false, error: err.message || 'Failed to load tree details' });
    }
  },

  logActivity: (activity) =>
    set((state) => ({
      activityLog: [
        {
          ...activity,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
        },
        ...state.activityLog,
      ].slice(0, 50),
    })),

  setTree: (treeId) => {
    if (get().treeId !== treeId || get().persons.length === 0) {
      get().fetchTreeData(treeId);
    } else {
      set({ treeId });
    }
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFilterPanel: () => set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
  setPersons: (persons) => set({ persons }),
  setRelationships: (relationships) => set({ relationships }),
  selectPerson: (personId) => set({ selectedPersonId: personId, sidePanelOpen: !!personId }),
  closeSidePanel: () => set({ sidePanelOpen: false, selectedPersonId: null }),
  setSidePanelTab: (tab) => set({ sidePanelTab: tab }),
  openAddPersonModal: (defaults) =>
    set({ addPersonModalOpen: true, addPersonModalDefaults: defaults || null }),
  closeAddPersonModal: () => set({ addPersonModalOpen: false, addPersonModalDefaults: null }),

  toggleFilter: (category, value) =>
    set((state) => {
      const current = (state.filters[category] as any[]) || [];
      return {
        filters: {
          ...state.filters,
          [category]: current.includes(value)
            ? current.filter((v: any) => v !== value)
            : [...current, value],
        },
      };
    }),

  clearFilters: () =>
    set({
      filters: {
        generations: [],
        lifeStages: [],
        demographics: [],
        locations: [],
        birthMonths: [],
        vitalStatus: [],
      },
    }),

  updatePersonPosition: (personId, x, y) => {
    set((state) => ({
      pendingPositionUpdates: {
        ...state.pendingPositionUpdates,
        [personId]: { x, y },
      },
      persons: state.persons.map((p) =>
        p.id === personId ? { ...p, canvasX: x, canvasY: y } : p
      ),
    }));
  },

  flushPositionUpdates: async () => {
    const updates = get().pendingPositionUpdates;
    const treeId = get().treeId || '1';
    if (Object.keys(updates).length === 0) return;

    set({ isSaving: true, error: null });
    try {
      await apiFetch(`/api/trees/${treeId}/positions`, {
        method: 'PUT',
        body: JSON.stringify({ positions: updates }),
      });
      set({ pendingPositionUpdates: {}, isSaving: false });
      get().logActivity({
        type: 'update',
        message: `Saved coordinates of ${Object.keys(updates).length} individuals to Cloud SQL.`,
      });
    } catch (err: any) {
      console.error('Failed to save positions to Cloud SQL:', err);
      set({ isSaving: false, error: err.message || 'Failed to save positions' });
    }
  },

  updatePersonLocally: (personId, data) => {
    set((state) => ({
      persons: state.persons.map((p) => (p.id === personId ? { ...p, ...data } : p)),
    }));
  },

  savePersonToDb: async (personId: string) => {
    const treeId = get().treeId || '1';
    const person = get().persons.find((p) => p.id === personId);
    if (!person) return;
    set({ isSaving: true, error: null });
    try {
      await apiFetch(`/api/trees/${treeId}/persons/${personId}`, {
        method: 'PATCH',
        body: JSON.stringify(person),
      });
      const name = `${person.firstName} ${person.lastName}`.trim();
      get().logActivity({
        type: 'update',
        message: `Updated the details for ${name}`,
      });
      set({ isSaving: false });
    } catch (err: any) {
      console.error('Failed to update person in Cloud SQL:', err);
      set({ isSaving: false, error: err.message || 'Failed to update person' });
    }
  },

  addPersonLocally: async (person) => {
    const treeId = person.treeId || get().treeId || '1';
    set((state) => ({
      persons: [...state.persons, person],
      trees: state.trees.map((t) =>
        t.id === treeId ? { ...t, persons: t.persons + 1 } : t
      ),
    }));
    get().logActivity({
      type: 'add',
      message: `Added ${person.firstName} ${person.lastName} to the tree`,
    });
    try {
      await apiFetch(`/api/trees/${treeId}/persons`, {
        method: 'POST',
        body: JSON.stringify(person),
      });
    } catch (err: any) {
      console.error('Failed to add person to Cloud SQL:', err);
      set({ error: err.message || 'Failed to add person' });
    }
  },

  removePersonLocally: async (personId) => {
    const treeId = get().treeId || '1';
    const person = get().persons.find((p) => p.id === personId);
    const name = person ? `${person.firstName} ${person.lastName}`.trim() : 'Unknown';

    set((state) => ({
      persons: state.persons.filter((p) => p.id !== personId),
      relationships: state.relationships.filter(
        (r) => r.person1Id !== personId && r.person2Id !== personId
      ),
      selectedPersonId: state.selectedPersonId === personId ? null : state.selectedPersonId,
      sidePanelOpen: state.selectedPersonId === personId ? false : state.sidePanelOpen,
      trees: state.trees.map((t) =>
        t.id === treeId ? { ...t, persons: Math.max(0, t.persons - 1) } : t
      ),
    }));
    get().logActivity({
      type: 'delete',
      message: `Removed ${name} from the tree`,
    });

    try {
      await apiFetch(`/api/trees/${treeId}/persons/${personId}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      console.error('Failed to delete person from Cloud SQL:', err);
      set({ error: err.message || 'Failed to delete person' });
    }
  },

  addRelationshipLocally: async (rel) => {
    const treeId = rel.treeId || get().treeId || '1';
    set((state) => ({
      relationships: [...state.relationships, rel],
    }));
    try {
      await apiFetch(`/api/trees/${treeId}/relationships`, {
        method: 'POST',
        body: JSON.stringify(rel),
      });
    } catch (err: any) {
      console.error('Failed to create relationship in Cloud SQL:', err);
      set({ error: err.message || 'Failed to create relationship' });
    }
  },

  removeRelationshipLocally: async (relId) => {
    const treeId = get().treeId || '1';
    set((state) => ({
      relationships: state.relationships.filter((r) => r.id !== relId),
    }));
    try {
      await apiFetch(`/api/trees/${treeId}/relationships/${relId}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      console.error('Failed to delete relationship in Cloud SQL:', err);
      set({ error: err.message || 'Failed to delete relationship' });
    }
  },

  addTreeLocally: async (tree) => {
    set((state) => ({
      trees: [...state.trees, tree],
    }));
    try {
      await apiFetch('/api/trees', {
        method: 'POST',
        body: JSON.stringify({ id: tree.id, name: tree.name }),
      });
    } catch (err: any) {
      console.error('Failed to create tree in Cloud SQL:', err);
      set({ error: err.message || 'Failed to create tree' });
    }
  },

  removeTreeLocally: async (treeId) => {
    set((state) => ({
      trees: state.trees.filter((t) => t.id !== treeId),
    }));
    try {
      await apiFetch(`/api/trees/${treeId}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      console.error('Failed to delete tree in Cloud SQL:', err);
      set({ error: err.message || 'Failed to delete tree' });
    }
  },
}));
