/**
 * @fileoverview User management store with keepsync integration
 * Uses a flat data structure for optimal Automerge compatibility
 */

import { create } from 'zustand';
import { sync } from '@tonk/keepsync';

/** Core user data interface - kept minimal for sync */
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/** 
 * Synced state structure
 * Flat array for optimal Automerge compatibility
 */
interface SyncedState {
  users: User[];
}

/** UI-specific state that doesn't need sync */
interface LocalState {
  isLoading: boolean;
  error: string | null;
}

/** Complete store state */
interface UserState extends SyncedState, LocalState {}

/** Store actions */
interface UserActions {
  registerUser: (name: string, email: string) => Promise<User>;
  loginUser: (email: string, password: string) => Promise<User>;
  getUserByEmail: (email: string) => User | undefined;
  clearError: () => void;
}

/** Combined store type */
type UserStore = UserState & UserActions;

/**
 * Creates the user store with keepsync integration
 */
export const useUserStore = create<UserStore>(
  sync(
    (set, get) => ({
      // Synced state
      users: [],

      // Local state
      isLoading: false,
      error: null,

      registerUser: async (name: string, email: string) => {
        set({ isLoading: true, error: null });

        try {
          // Create new user with minimal required data
          const newUser: User = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            createdAt: new Date().toISOString()
          };

          // Update users array atomically
          set((state) => ({
            users: [...state.users, newUser]
          }));

          set({ isLoading: false });
          return newUser;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ 
            isLoading: false,
            error: errorMessage
          });
          throw new Error(errorMessage);
        }
      },

      loginUser: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const user = get().getUserByEmail(email);
          
          if (!user) {
            throw new Error('Invalid email or password');
          }

          // In a real application, you would verify the password hash here
          // For this example, we'll just simulate successful login
          
          set({ isLoading: false });
          return user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ 
            isLoading: false,
            error: errorMessage
          });
          throw new Error(errorMessage);
        }
      },

      getUserByEmail: (email: string) => {
        return get().users.find(
          user => user.email.toLowerCase() === email.toLowerCase()
        );
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      // Use flatmade-users as the document ID
      docId: 'flatmade-users'
    }
  )
);