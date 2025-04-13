import { sync } from "@tonk/keepsync";
import { create } from "zustand";

export interface Proof {
  id: string; // Matches corresponding chore ID
  text: string;
  imageUrl?: string; 
  createdAt: Date;
}

interface ProofState {
  proofs: Proof[];
  addProof: (proof: Omit<Proof, 'createdAt'>) => void;
  getProofById: (id: string) => Proof | undefined;
  updateProof: (id: string, updates: Partial<Proof>) => void;
  deleteProof: (id: string) => void;
  clearAllProofs: () => void;
}

export const useProofStore = create<ProofState>(
  sync(
    (set, get) => ({
      proofs: [],

      addProof: (proof) => {
        set((state) => ({
          proofs: [
            ...state.proofs,
            {
              ...proof,
              createdAt: new Date(),
            },
          ],
        }));
      },

      getProofById: (id) => {
        return get().proofs.find((proof) => proof.id === id);
      },

      updateProof: (id, updates) => {
        set((state) => ({
          proofs: state.proofs.map((proof) =>
            proof.id === id ? { ...proof, ...updates } : proof
          ),
        }));
      },

      deleteProof: (id) => {
        set((state) => ({
          proofs: state.proofs.filter((proof) => proof.id !== id),
        }));
      },

      clearAllProofs: () => {
        set({ proofs: [] });
      },
    }),
    {
      docId: "proofs",
    }
  )
); 