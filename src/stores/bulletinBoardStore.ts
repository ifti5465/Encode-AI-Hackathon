/**
 * @fileoverview Bulletin board store with keepsync integration for real-time updates
 * Manages posts, channels, and notifications for the building bulletin board
 */

import { create } from 'zustand';
import { sync } from '@tonk/keepsync';

/** Post data structure */
export interface Post {
  id: string;
  channelId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  isPinned: boolean;
  isHighPriority: boolean;
  attachmentUrls?: string[];
}

/** Comment on a post */
export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

/** Channel information */
export interface Channel {
  id: string;
  name: string;
  description: string;
  emoji: string;
  createdAt: string;
  createdBy: string;
  isStaffOnly: boolean;
  isReadOnly: boolean;
}

/** User notification preferences */
export interface NotificationPreference {
  userId: string;
  channelId: string;
  isMuted: boolean;
}

/** Notification item */
export interface Notification {
  id: string;
  userId: string;
  type: 'new_post' | 'new_comment' | 'mention' | 'high_priority';
  referenceId: string; // Post or comment ID
  channelId: string;
  isRead: boolean;
  createdAt: string;
}

/** Synced state structure */
interface SyncedState {
  channels: Channel[];
  posts: Post[];
  comments: Comment[];
  notifications: Notification[];
  notificationPreferences: NotificationPreference[];
}

/** Local UI state */
interface LocalState {
  selectedChannelId: string | null;
  selectedPostId: string | null;
  isAddingPost: boolean;
  isAddingComment: boolean;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

/** Store actions */
interface BulletinBoardActions {
  // Channel actions
  addChannel: (name: string, description: string, emoji: string, isStaffOnly: boolean, isReadOnly: boolean) => void;
  updateChannel: (id: string, updates: Partial<Omit<Channel, 'id' | 'createdAt' | 'createdBy'>>) => void;
  
  // Post actions
  addPost: (channelId: string, title: string, content: string, authorId: string, authorName: string, isHighPriority?: boolean, attachmentUrls?: string[]) => void;
  updatePost: (id: string, updates: Partial<Omit<Post, 'id' | 'channelId' | 'authorId' | 'authorName' | 'createdAt'>>) => void;
  deletePost: (id: string) => void;
  pinPost: (id: string, isPinned: boolean) => void;
  
  // Comment actions
  addComment: (postId: string, content: string, authorId: string, authorName: string) => void;
  updateComment: (id: string, content: string) => void;
  deleteComment: (id: string) => void;
  
  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  setNotificationPreference: (userId: string, channelId: string, isMuted: boolean) => void;
  
  // UI actions
  selectChannel: (channelId: string | null) => void;
  selectPost: (postId: string | null) => void;
  setIsAddingPost: (isAdding: boolean) => void;
  setIsAddingComment: (isAdding: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  
  // Utility getters
  getChannelById: (id: string) => Channel | undefined;
  getPostById: (id: string) => Post | undefined;
  getCommentsByPostId: (postId: string) => Comment[];
  getPostsByChannelId: (channelId: string) => Post[];
  getUserNotifications: (userId: string) => Notification[];
  searchPosts: (query: string) => Post[];
}

/** Combined store type */
type BulletinBoardStore = SyncedState & LocalState & BulletinBoardActions;

// Predefined channels
const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'maintenance',
    name: 'Maintenance & Building Notices',
    description: 'Important updates about building maintenance and facilities',
    emoji: '🔧',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    isStaffOnly: true,
    isReadOnly: false
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Upcoming events and activities in the building',
    emoji: '📢',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    isStaffOnly: false,
    isReadOnly: false
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Buy, sell, or give away items with your neighbors',
    emoji: '🛍️',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    isStaffOnly: false,
    isReadOnly: false
  },
  {
    id: 'general',
    name: 'General Chat',
    description: 'General discussion and questions',
    emoji: '💬',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    isStaffOnly: false,
    isReadOnly: false
  },
  {
    id: 'housekeeping',
    name: 'Chores & Housekeeping',
    description: 'Discussions about cleaning and household chores',
    emoji: '🧼',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    isStaffOnly: false,
    isReadOnly: false
  }
];

/**
 * Creates the bulletin board store with keepsync integration
 */
export const useBulletinBoardStore = create<BulletinBoardStore>(
  sync(
    (set, get) => ({
      // Synced state
      channels: INITIAL_CHANNELS,
      posts: [],
      comments: [],
      notifications: [],
      notificationPreferences: [],
      
      // Local state
      selectedChannelId: null,
      selectedPostId: null,
      isAddingPost: false,
      isAddingComment: false,
      searchQuery: '',
      isLoading: false,
      error: null,
      
      // Channel actions
      addChannel: (name, description, emoji, isStaffOnly, isReadOnly) => {
        const newChannel: Channel = {
          id: crypto.randomUUID(),
          name: name.trim(),
          description: description.trim(),
          emoji,
          createdAt: new Date().toISOString(),
          createdBy: 'current_user', // In a real app, get from auth context
          isStaffOnly,
          isReadOnly
        };
        
        set((state) => ({
          channels: [...state.channels, newChannel]
        }));
      },
      
      updateChannel: (id, updates) => {
        set((state) => ({
          channels: state.channels.map((channel) =>
            channel.id === id ? { ...channel, ...updates } : channel
          )
        }));
      },
      
      // Post actions
      addPost: (channelId, title, content, authorId, authorName, isHighPriority = false, attachmentUrls = []) => {
        const newPost: Post = {
          id: crypto.randomUUID(),
          channelId,
          title: title.trim(),
          content: content.trim(),
          authorId,
          authorName,
          createdAt: new Date().toISOString(),
          isPinned: false,
          isHighPriority,
          attachmentUrls
        };
        
        set((state) => ({
          posts: [...state.posts, newPost]
        }));
        
        // Create notifications for users (except author) who haven't muted this channel
        const { notificationPreferences } = get();
        const nonMutedUserIds = notificationPreferences
          .filter(pref => pref.channelId === channelId && !pref.isMuted)
          .map(pref => pref.userId)
          .filter(userId => userId !== authorId);
        
        // Create new notifications for high priority posts or regular posts
        const notificationType = isHighPriority ? 'high_priority' : 'new_post';
        const newNotifications = nonMutedUserIds.map(userId => ({
          id: crypto.randomUUID(),
          userId,
          type: notificationType,
          referenceId: newPost.id,
          channelId,
          isRead: false,
          createdAt: new Date().toISOString()
        }));
        
        if (newNotifications.length > 0) {
          set((state) => ({
            notifications: [...state.notifications, ...newNotifications]
          }));
        }
      },
      
      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id
              ? { ...post, ...updates, updatedAt: new Date().toISOString() }
              : post
          )
        }));
      },
      
      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== id),
          // Also remove associated comments and notifications
          comments: state.comments.filter((comment) => comment.postId !== id),
          notifications: state.notifications.filter((notification) => 
            notification.referenceId !== id || 
            (notification.type !== 'new_post' && notification.type !== 'high_priority')
          )
        }));
      },
      
      pinPost: (id, isPinned) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id ? { ...post, isPinned } : post
          )
        }));
      },
      
      // Comment actions
      addComment: (postId, content, authorId, authorName) => {
        const newComment: Comment = {
          id: crypto.randomUUID(),
          postId,
          content: content.trim(),
          authorId,
          authorName,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          comments: [...state.comments, newComment]
        }));
        
        // Find the post to get channel and post author
        const post = get().getPostById(postId);
        if (!post) return;
        
        // Create notification for post author (if not the commenter)
        if (post.authorId !== authorId) {
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            userId: post.authorId,
            type: 'new_comment',
            referenceId: newComment.id,
            channelId: post.channelId,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          
          set((state) => ({
            notifications: [...state.notifications, newNotification]
          }));
        }
        
        // Create notifications for @mentions
        // Simplified implementation - a more robust version would parse the content more carefully
        const mentionRegex = /@(\w+)/g;
        const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);
        
        if (mentions.length > 0) {
          // In a real app, we would resolve these usernames to IDs
          // For now, we'll assume the username is the ID for simplicity
          const mentionNotifications = mentions
            .filter(userId => userId !== authorId) // Don't notify yourself
            .map(userId => ({
              id: crypto.randomUUID(),
              userId,
              type: 'mention' as const,
              referenceId: newComment.id,
              channelId: post.channelId,
              isRead: false,
              createdAt: new Date().toISOString()
            }));
          
          if (mentionNotifications.length > 0) {
            set((state) => ({
              notifications: [...state.notifications, ...mentionNotifications]
            }));
          }
        }
      },
      
      updateComment: (id, content) => {
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === id
              ? { ...comment, content, updatedAt: new Date().toISOString() }
              : comment
          )
        }));
      },
      
      deleteComment: (id) => {
        set((state) => ({
          comments: state.comments.filter((comment) => comment.id !== id),
          // Also remove associated notifications
          notifications: state.notifications.filter((notification) => 
            notification.referenceId !== id || 
            (notification.type !== 'new_comment' && notification.type !== 'mention')
          )
        }));
      },
      
      // Notification actions
      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        }));
      },
      
      markAllNotificationsAsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.userId === userId ? { ...notification, isRead: true } : notification
          )
        }));
      },
      
      setNotificationPreference: (userId, channelId, isMuted) => {
        const { notificationPreferences } = get();
        const existingPref = notificationPreferences.find(
          pref => pref.userId === userId && pref.channelId === channelId
        );
        
        if (existingPref) {
          // Update existing preference
          set((state) => ({
            notificationPreferences: state.notificationPreferences.map((pref) =>
              pref.userId === userId && pref.channelId === channelId
                ? { ...pref, isMuted }
                : pref
            )
          }));
        } else {
          // Add new preference
          set((state) => ({
            notificationPreferences: [
              ...state.notificationPreferences,
              { userId, channelId, isMuted }
            ]
          }));
        }
      },
      
      // UI actions
      selectChannel: (channelId) => {
        set({ selectedChannelId: channelId, selectedPostId: null });
      },
      
      selectPost: (postId) => {
        set({ selectedPostId: postId });
      },
      
      setIsAddingPost: (isAdding) => {
        set({ isAddingPost: isAdding });
      },
      
      setIsAddingComment: (isAdding) => {
        set({ isAddingComment: isAdding });
      },
      
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Utility getters
      getChannelById: (id) => {
        return get().channels.find(channel => channel.id === id);
      },
      
      getPostById: (id) => {
        return get().posts.find(post => post.id === id);
      },
      
      getCommentsByPostId: (postId) => {
        return get().comments
          .filter(comment => comment.postId === postId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },
      
      getPostsByChannelId: (channelId) => {
        return get().posts
          .filter(post => post.channelId === channelId)
          .sort((a, b) => {
            // Pinned posts first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Then sort by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
      },
      
      getUserNotifications: (userId) => {
        return get().notifications
          .filter(notification => notification.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      searchPosts: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().posts
          .filter(post => 
            post.title.toLowerCase().includes(lowerQuery) || 
            post.content.toLowerCase().includes(lowerQuery)
          )
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }),
    {
      // Use flatmade-bulletin-board as the document ID
      docId: 'flatmade-bulletin-board'
    }
  )
); 