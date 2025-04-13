/**
 * @fileoverview User management store with keepsync integration
 * Uses a flat data structure for optimal Automerge compatibility
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sync } from '@tonk/keepsync';

/** Core user data interface - kept minimal for sync */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  points: number;
}

/** 
 * Synced state structure
 * Flat array for optimal Automerge compatibility
 */
interface SyncedState {
  users: User[];
  currentUser: string | null;
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
  getUserById: (id: string) => User | undefined;
  getUsers: () => User[];
  updateUserPoints: (userId: string, points: number) => void;
  setCurrentUser: (userId: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

/** Combined store type */
type UserStore = UserState & UserActions;

// Load previously stored current user, if any
const getStoredUser = () => {
  try {
    return localStorage.getItem('flatmade_current_user');
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return null;
  }
};

/**
 * Creates the user store with keepsync integration and persistence
 */
export const useUserStore = create<UserStore>()(
  persist(
    sync(
      (set, get) => ({
        // Synced state
        users: [],
        // Initialize current user from localStorage if available
        currentUser: getStoredUser(),

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
              createdAt: new Date().toISOString(),
              points: 0 // Explicitly initialize points to 0
            };

            // Update users array atomically
            set((state) => ({
              users: [...state.users, newUser]
            }));

            // Set current user
            const currentUserId = newUser.id;
            set({ currentUser: currentUserId });
            
            // Store in localStorage
            try {
              localStorage.setItem('flatmade_current_user', currentUserId);
            } catch (e) {
              console.error('Error storing current user:', e);
            }

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
            
            // Set the current user upon successful login
            const currentUserId = user.id;
            set({ currentUser: currentUserId });
            
            // Store in localStorage
            try {
              localStorage.setItem('flatmade_current_user', currentUserId);
            } catch (e) {
              console.error('Error storing current user:', e);
            }
            
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

        getUserById: (id: string) => {
          return get().users.find(user => user.id === id);
        },

        getUsers: () => {
          return get().users;
        },

        updateUserPoints: (userId: string, points: number) => {
          set((state) => ({
            users: state.users.map((user) =>
              user.id === userId
                ? { 
                    ...user, 
                    points: (user.points || 0) + points // Ensure points is initialized if undefined
                  }
                : user
            )
          }));
        },

        setCurrentUser: (userId: string | null) => {
          set({ currentUser: userId });
          
          // Synchronize with localStorage
          try {
            if (userId) {
              localStorage.setItem('flatmade_current_user', userId);
            } else {
              localStorage.removeItem('flatmade_current_user');
            }
          } catch (e) {
            console.error('Error accessing localStorage:', e);
          }
        },
        
        logout: () => {
          // Clear current user
          set({ currentUser: null });
          
          // Remove from localStorage
          try {
            localStorage.removeItem('flatmade_current_user');
          } catch (e) {
            console.error('Error removing current user from localStorage:', e);
          }
        },

        clearError: () => {
          set({ error: null });
        }
      }),
      {
        // Use flatmade-users as the document ID
        docId: 'flatmade-users'
      }
    ),
    {
      name: 'flatmade-user-storage', // name for the persisted store
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({ currentUser: state.currentUser }), // only persist the currentUser field
    }
  )
);