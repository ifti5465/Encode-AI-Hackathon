/**
 * @fileoverview Bulletin board store with keepsync integration
 * Uses a flat data structure for optimal Automerge compatibility
 */

import { create } from 'zustand';
import { sync } from '@tonk/keepsync';

/** Core interfaces for bulletin board data */
export interface Channel {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isStaffOnly: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  channelId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isPinned: boolean;
  isHighPriority: boolean;
  attachmentUrls?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_post' | 'new_comment' | 'mention' | 'high_priority';
  channelId: string;
  referenceId: string;
  createdAt: string;
  isRead: boolean;
}

/** Synced state structure */
interface SyncedState {
  channels: Channel[];
  posts: Post[];
  comments: Comment[];
  notifications: Notification[];
}

/** UI-specific state that doesn't need sync */
interface LocalState {
  selectedChannelId: string | null;
  selectedPostId: string | null;
  isAddingPost: boolean;
  isAddingComment: boolean;
  searchQuery: string;
}

/** Complete store state */
interface BulletinBoardState extends SyncedState, LocalState {}

/** Store actions */
interface BulletinBoardActions {
  // Channel actions
  getChannelById: (id: string) => Channel | undefined;
  addChannel: (channel: Omit<Channel, 'id' | 'createdAt'>) => void;
  
  // Post actions
  getPostById: (id: string) => Post | undefined;
  getPostsByChannelId: (channelId: string) => Post[];
  addPost: (
    channelId: string,
    title: string,
    content: string,
    authorId: string,
    authorName: string,
    isHighPriority: boolean
  ) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  pinPost: (id: string, isPinned: boolean) => void;
  searchPosts: (query: string) => Post[];
  
  // Comment actions
  getCommentsByPostId: (postId: string) => Comment[];
  addComment: (
    postId: string,
    content: string,
    authorId: string,
    authorName: string
  ) => void;
  deleteComment: (id: string) => void;
  
  // Notification actions
  getUserNotifications: (userId: string) => Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  setNotificationPreference: (userId: string, type: string, enabled: boolean) => void;
  
  // UI actions
  selectChannel: (channelId: string | null) => void;
  selectPost: (postId: string | null) => void;
  setIsAddingPost: (isAdding: boolean) => void;
  setIsAddingComment: (isAdding: boolean) => void;
  setSearchQuery: (query: string) => void;
}

/** Combined store type */
type BulletinBoardStore = BulletinBoardState & BulletinBoardActions;

/**
 * Creates the bulletin board store with keepsync integration
 */
export const useBulletinBoardStore = create<BulletinBoardStore>(
  sync(
    (set, get) => ({
      // Synced state
      channels: [],
      posts: [],
      comments: [],
      notifications: [],

      // Local state
      selectedChannelId: null,
      selectedPostId: null,
      isAddingPost: false,
      isAddingComment: false,
      searchQuery: '',

      // Channel actions
      getChannelById: (id) => {
        return get().channels.find(channel => channel.id === id);
      },

      addChannel: (channel) => {
        const newChannel: Channel = {
          ...channel,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          channels: [...state.channels, newChannel]
        }));
      },

      // Post actions
      getPostById: (id) => {
        return get().posts.find(post => post.id === id);
      },

      getPostsByChannelId: (channelId) => {
        return get().posts.filter(post => post.channelId === channelId);
      },

      addPost: (channelId, title, content, authorId, authorName, isHighPriority) => {
        const newPost: Post = {
          id: crypto.randomUUID(),
          channelId,
          title,
          content,
          authorId,
          authorName,
          createdAt: new Date().toISOString(),
          isPinned: false,
          isHighPriority
        };

        set((state) => ({
          posts: [...state.posts, newPost]
        }));

        // Create notifications for high priority posts
        if (isHighPriority) {
          const notification: Notification = {
            id: crypto.randomUUID(),
            userId: authorId,
            type: 'high_priority',
            channelId,
            referenceId: newPost.id,
            createdAt: new Date().toISOString(),
            isRead: false
          };

          set((state) => ({
            notifications: [...state.notifications, notification]
          }));
        }
      },

      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id ? { ...post, ...updates } : post
          )
        }));
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== id),
          comments: state.comments.filter((comment) => comment.postId !== id),
          notifications: state.notifications.filter((notification) => notification.referenceId !== id)
        }));
      },

      pinPost: (id, isPinned) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id ? { ...post, isPinned } : post
          )
        }));
      },

      searchPosts: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().posts.filter(post =>
          post.title.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery)
        );
      },

      // Comment actions
      getCommentsByPostId: (postId) => {
        return get().comments.filter(comment => comment.postId === postId);
      },

      addComment: (postId, content, authorId, authorName) => {
        const post = get().getPostById(postId);
        if (!post) return;

        const newComment: Comment = {
          id: crypto.randomUUID(),
          postId,
          content,
          authorId,
          authorName,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          comments: [...state.comments, newComment]
        }));

        // Create notification for post author
        if (post.authorId !== authorId) {
          const notification: Notification = {
            id: crypto.randomUUID(),
            userId: post.authorId,
            type: 'new_comment',
            channelId: post.channelId,
            referenceId: postId,
            createdAt: new Date().toISOString(),
            isRead: false
          };

          set((state) => ({
            notifications: [...state.notifications, notification]
          }));
        }
      },

      deleteComment: (id) => {
        set((state) => ({
          comments: state.comments.filter((comment) => comment.id !== id),
          notifications: state.notifications.filter((notification) => notification.referenceId !== id)
        }));
      },

      // Notification actions
      getUserNotifications: (userId) => {
        return get().notifications.filter(notification => notification.userId === userId);
      },

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

      setNotificationPreference: (userId, type, enabled) => {
        // This would typically update user preferences in a real app
        console.log(`Setting ${type} notifications to ${enabled} for user ${userId}`);
      },

      // UI actions
      selectChannel: (channelId) => {
        set({ selectedChannelId: channelId });
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
      }
    }),
    {
      docId: 'bulletin-board'
    }
  )
); 