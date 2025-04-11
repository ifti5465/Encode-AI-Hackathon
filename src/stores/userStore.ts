/**
 * @fileoverview User management store that handles registration and user state
 * using keepsync for real-time synchronization across clients.
 * 
 * Key features:
 * - Atomic state updates
 * - Separation of synced and local state
 * - Type-safe operations
 * - Real-time sync with keepsync
 */

import { create } from 'zustand';
import { sync } from '@tonk/keepsync';

/** Core user data interface */
interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's full name */
  name: string;
  /** User's email address (used as unique identifier for login) */
  email: string;
}

/** 
 * State interface defining all readable properties
 * Keeps synced state flat and separate from local state
 */
interface UserState {
  /** List of all registered users - synced across clients */
  users: User[];
  /** Currently active user - local only */
  currentUser: User | null;
  /** Loading state - local only */
  isLoading: boolean;
  /** Error message - local only */
  error: string | null;
}

/** Actions interface defining all state modifications */
interface UserActions {
  /** Register a new user with the given details */
  registerUser: (name: string, email: string) => Promise<User>;
  /** Find a user by their email address */
  getUserByEmail: (email: string) => User | undefined;
  /** Set the current active user */
  setCurrentUser: (user: User | null) => void;
  /** Clear any error messages */
  clearError: () => void;
}

/** Combined type for the complete store */
type UserStore = UserState & UserActions;

/**
 * Creates a Zustand store for managing user registration and authentication
 * Uses keepsync for real-time synchronization across clients
 * 
 * @example
 * const { users, registerUser } = useUserStore()
 * await registerUser('John Doe', 'john@example.com')
 */
export const useUserStore = create<UserStore>(
  sync(
    (set, get) => ({
      // Initial state - flat structure for better Automerge compatibility
      users: [],
      currentUser: null,
      isLoading: false,
      error: null,

      // Actions
      registerUser: async (name: string, email: string) => {
        // Update loading state atomically
        set({ isLoading: true, error: null });

        try {
          const newUser: User = {
            id: crypto.randomUUID(),
            name,
            email,
          };

          // Update synced state (users) atomically
          set({ users: [...get().users, newUser] });
          // Update local state (currentUser, loading) separately
          set({ currentUser: newUser, isLoading: false });

          return newUser;
        } catch (error) {
          // Update error state atomically
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to register user'
          });
          throw error;
        }
      },

      getUserByEmail: (email: string) => {
        return get().users.find(user => user.email === email);
      },

      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      docId: 'users',
      initTimeout: 30000,
      onInitError: (error) => {
        console.error('User store sync initialization error:', error);
        useUserStore.setState({ error: 'Failed to initialize user synchronization' });
      }
    }
  )
);