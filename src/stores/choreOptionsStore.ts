import { sync } from "@tonk/keepsync";
import { create } from "zustand";

interface ChoreOptionsState {
  categories: string[];
  choreNames: string[];
  addCategory: (category: string) => void;
  addChoreName: (name: string) => void;
  getCategories: () => string[];
  getChoreNames: () => string[];
}

export const useChoreOptionsStore = create<ChoreOptionsState>(
  sync(
    (set, get) => ({
      categories: [],
      choreNames: [],

      addCategory: (category: string) => {
        // Only add if not already present (case-insensitive check)
        set((state) => {
          const normalizedCategory = category.trim();
          if (normalizedCategory && 
              !state.categories.some(cat => 
                cat.toLowerCase() === normalizedCategory.toLowerCase())) {
            return { 
              categories: [...state.categories, normalizedCategory].sort() 
            };
          }
          return state;
        });
      },

      addChoreName: (name: string) => {
        // Only add if not already present (case-insensitive check)
        set((state) => {
          const normalizedName = name.trim();
          if (normalizedName && 
              !state.choreNames.some(n => 
                n.toLowerCase() === normalizedName.toLowerCase())) {
            return { 
              choreNames: [...state.choreNames, normalizedName].sort() 
            };
          }
          return state;
        });
      },

      getCategories: () => {
        return get().categories;
      },

      getChoreNames: () => {
        return get().choreNames;
      },
    }),
    {
      docId: "choreOptions",
    }
  )
); 