import { sync } from "@tonk/keepsync";
import { create } from "zustand";
import type { ChoreFrequency } from "../components/TaskCard";

export interface Chore {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  assignedTo?: string; // Will store user ID once user store is available
  completedAt?: Date;
  category: string;
  points: number;
  frequency: ChoreFrequency;
  proof?: {
    text?: string;
    imageUrl?: string;
  };
}

interface ChoreState {
  chores: Chore[];
  addChore: (chore: Omit<Chore, 'id'>) => void;
  updateChore: (id: string, updates: Partial<Chore>) => void;
  deleteChore: (id: string) => void;
  completeChore: (id: string, proof?: { text?: string; imageUrl?: string }) => void;
  assignChore: (id: string, userId: string) => void;
  clearAllChores: () => void;
}

export const useChoreStore = create<ChoreState>(
  sync(
    (set) => ({
      chores: [],

      addChore: (chore) => {
        set((state) => ({
          chores: [
            ...state.chores,
            {
              ...chore,
              id: crypto.randomUUID(),
              points: chore.points || 5,
              frequency: chore.frequency || 'once',
            },
          ],
        }));
      },

      updateChore: (id, updates) => {
        set((state) => ({
          chores: state.chores.map((chore) =>
            chore.id === id ? { ...chore, ...updates } : chore
          ),
        }));
      },

      deleteChore: (id) => {
        set((state) => ({
          chores: state.chores.filter((chore) => chore.id !== id),
        }));
      },

      completeChore: (id, proof) => {
        set((state) => ({
          chores: state.chores.map((chore) =>
            chore.id === id
              ? {
                  ...chore,
                  status: 'completed',
                  completedAt: new Date(),
                  proof
                }
              : chore
          ),
        }));
      },

      assignChore: (id, userId) => {
        set((state) => ({
          chores: state.chores.map((chore) =>
            chore.id === id
              ? {
                  ...chore,
                  assignedTo: userId,
                }
              : chore
          ),
        }));
      },

      clearAllChores: () => {
        set({ chores: [] });
      },
    }),
    {
      docId: "chores",
    }
  )
); 