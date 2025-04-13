import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBulletinBoardStore } from "../stores/bulletinBoardStore";
import { useUserStore } from "../stores/userStore";
import {
  Plus,
  Search,
  Bell,
  Pin,
  MessageSquare,
  Send,
  Home,
  Trash2,
  AlertTriangle,
  Paperclip,
  X,
  MoreVertical,
  Settings,
  Clipboard,
  MessageCircle,
  PlusCircle
} from "lucide-react";
import Header from '../components/Header';
import { initializeBulletinBoard } from '../utils/initBulletinBoard';

const BulletinBoard: React.FC = () => {
  const navigate = useNavigate();
  
  // Get state and actions from store
  const {
    channels,
    posts,
    comments,
    notifications,
    selectedChannelId,
    selectedPostId,
    isAddingPost,
    isAddingComment,
    searchQuery,
    getChannelById,
    getPostById,
    getCommentsByPostId,
    getPostsByChannelId,
    getUserNotifications,
    searchPosts,
    selectChannel,
    selectPost,
    setIsAddingPost,
    setIsAddingComment,
    setSearchQuery,
    addPost,
    updatePost,
    deletePost,
    pinPost,
    addComment,
    deleteComment,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setNotificationPreference
  } = useBulletinBoardStore();
  
  // Get current user info from user store
  const { currentUser, getUserById } = useUserStore();
  const userInfo = currentUser ? getUserById(currentUser) : null;
  
  // Local state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [isStaffView, setIsStaffView] = useState(false); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [selectedMenuPostId, setSelectedMenuPostId] = useState<string | null>(null);

  // Initialize bulletin board on mount
  useEffect(() => {
    initializeBulletinBoard();
  }, []);

  // Set default channel if none selected
  useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      selectChannel(channels[0].id);
    }
  }, [channels, selectedChannelId, selectChannel]);

  // Redirect to login if no user
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  // Initialize bulletin board with actual users
  useEffect(() => {
    // Only initialize if there are no channels yet but we have a current user
    if (channels.length === 0 && currentUser && userInfo) {
      // Create default channels
      [
        { name: 'General', emoji: '💬', description: 'General discussions for all flatmates', isStaffOnly: false },
        { name: 'Announcements', emoji: '📢', description: 'Important announcements from moderators', isStaffOnly: true },
        { name: 'Events', emoji: '🎉', description: 'Upcoming events and gatherings', isStaffOnly: false }
      ].forEach(channel => {
        useBulletinBoardStore.getState().addChannel(channel);
      });
      
      // Create a welcome post in General channel
      const generalChannel = useBulletinBoardStore.getState().channels[0];
      if (generalChannel) {
        useBulletinBoardStore.getState().addPost(
          generalChannel.id,
          'Welcome to the Bulletin Board!',
          'This is where you can communicate with your flatmates. Feel free to post messages, announcements, and more.',
          currentUser,
          userInfo.name,
          false
        );
      }
    }
  }, [channels.length, currentUser, userInfo]);
  
  // Calculate unread notifications count for current user
  useEffect(() => {
    if (currentUser) {
      const userNotifications = getUserNotifications(currentUser);
      const unread = userNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [notifications, currentUser]);
  
  // Filter posts based on current view
  const filteredPosts = selectedChannelId
    ? getPostsByChannelId(selectedChannelId)
    : searchQuery
    ? searchPosts(searchQuery)
    : [];
  
  // Sort posts: pinned first, then by date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Use user name from store
  const currentUserName = currentUser ? (getUserById(currentUser)?.name || 'Anonymous') : 'Anonymous';
  
  // Get details of selected channel and post
  const selectedChannel = selectedChannelId ? getChannelById(selectedChannelId) : null;
  const selectedPost = selectedPostId ? getPostById(selectedPostId) : null;
  const selectedPostComments = selectedPostId ? getCommentsByPostId(selectedPostId) : [];
  
  // Get current user's notifications
  const userNotifications = currentUser 
    ? notifications.filter(n => n.userId === currentUser)
    : [];
    
  // Handle adding a new post
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannelId || !currentUser || !userInfo) return;

    addPost(
      selectedChannelId,
      newPostTitle,
      newPostContent,
      currentUser,
      userInfo.name,
      isHighPriority
    );

    setNewPostTitle('');
    setNewPostContent('');
    setIsHighPriority(false);
    setIsAddingPost(false);
  };
  
  // Handle adding a comment to a post
  const handleAddComment = () => {
    if (!selectedPostId || !newCommentContent.trim() || !currentUser || !userInfo) return;
    
    addComment(
      selectedPostId,
      newCommentContent.trim(),
      currentUser,
      userInfo.name
    );
    
    setNewCommentContent("");
    setIsAddingComment(false);
  };
  
  // Handle marking notifications as read
  const handleReadNotification = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle notification menu
  const toggleNotificationMenu = () => {
    setShowNotificationMenu(!showNotificationMenu);
  };
  
  // Handle post menu
  const handlePostMenuOpen = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setSelectedMenuPostId(postId);
    setShowPostMenu(true);
  };
  
  const handlePostMenuClose = () => {
    setSelectedMenuPostId(null);
    setShowPostMenu(false);
  };
  
  // Handle mark all notifications as read
  const handleMarkAllAsRead = () => {
    if (currentUser) {
      markAllNotificationsAsRead(currentUser);
      setShowNotificationMenu(false);
    }
  };
  
  // Handle pin/unpin post
  const handlePinPost = (postId: string, isPinned: boolean) => {
    pinPost(postId, !isPinned);
    handlePostMenuClose();
  };
  
  // Handle delete post
  const handleDeletePost = (postId: string) => {
    deletePost(postId);
    handlePostMenuClose();
  };

  // Add effect to check if posts and comments are initialized
  useEffect(() => {
    // Debug function to add sample data if none exists
    const initializeSampleData = () => {
      if (posts.length === 0) {
        console.log("Initializing sample data");
        
        // Sample post for the selected channel
        if (selectedChannelId) {
          const postId = crypto.randomUUID();
          addPost(
            selectedChannelId,
            "Welcome to the Bulletin Board",
            "This is a sample post to get the conversation started. Feel free to add your own posts!",
            'user1',
            'Admin',
            false
          );
          
          // Add a sample comment to the post
          setTimeout(() => {
            const newPost = posts[0];
            if (newPost) {
              console.log("Adding sample comment to post:", newPost.id);
              addComment(
                newPost.id,
                "This is a sample comment to show how comments work!",
                'user2',
                'Resident'
              );
            }
          }, 500);
        }
      }
    };
    
    initializeSampleData();
  }, [posts, selectedChannelId, addPost, addComment]);

  // Add effect to initialize a user if none exists and debug data
  useEffect(() => {
    console.log("Current user state:", { currentUser, userInfo });
    
    const debugStoreState = () => {
      console.log("Store state:", {
        channels,
        posts: posts.length,
        comments: comments.length,
        currentUserId: currentUser,
        userInfo,
        selectedChannelId,
        selectedPostId
      });
      
      if (posts.length > 0) {
        console.log("Sample post:", posts[0]);
        const sampleComments = getCommentsByPostId(posts[0].id);
        console.log(`Sample post has ${sampleComments.length} comments:`, sampleComments);
      }
    };
    
    // Initialize a user if none exists
    const initializeUser = async () => {
      // Use getState to access functions without dependency issues
      const userStore = useUserStore.getState();
      
      if (!currentUser) {
        try {
          const users = userStore.getUsers();
          console.log("Current users:", users);
          
          if (users.length === 0) {
            console.log("Creating a test user");
            const newUser = await userStore.registerUser("Test User", "test@example.com");
            console.log("Created user:", newUser);
            userStore.setCurrentUser(newUser.id);
          } else if (users.length > 0) {
            console.log("Setting current user to first available user");
            userStore.setCurrentUser(users[0].id);
          }
        } catch (error) {
          console.error("Error initializing user:", error);
        }
      }
    };
    
    initializeUser();
    debugStoreState();
    
    // Set an interval to debug the store state periodically
    const interval = setInterval(debugStoreState, 2000);
    return () => clearInterval(interval);
  }, [currentUser, userInfo, channels, posts, comments, selectedChannelId, selectedPostId, getCommentsByPostId]);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannelId || !newPostContent.trim() || !currentUser || !userInfo) return;

    addPost(
      selectedChannelId,
      "Untitled Post",
      newPostContent,
      currentUser,
      userInfo.name,
      isHighPriority
    );
    setNewPostContent('');
    setIsHighPriority(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId || !newCommentContent.trim() || !currentUser || !userInfo) return;

    addComment(
      selectedPostId,
      newCommentContent,
      currentUser,
      userInfo.name
    );
    setNewCommentContent('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Header showDashboardButton showHomeButton />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Channel Selection */}
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => selectChannel(channel.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors
                  ${selectedChannelId === channel.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
              >
                <span>{channel.emoji}</span>
                <span>{channel.name}</span>
              </button>
            ))}
          </div>

          {/* Search and Add Post */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            {selectedChannel && (
              <button
                onClick={() => setIsAddingPost(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <PlusCircle size={20} />
                <span>New Post</span>
              </button>
            )}
          </div>

          {/* Add Post Form */}
          {isAddingPost && selectedChannel && (
            <form onSubmit={handleAddPost} className="bg-white/10 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-white">New Post in {selectedChannel.name}</h3>
              <input
                type="text"
                placeholder="Post title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <textarea
                placeholder="Post content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 min-h-[100px]"
                required
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="highPriority"
                  checked={isHighPriority}
                  onChange={(e) => setIsHighPriority(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="highPriority" className="text-white">Mark as high priority</label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddingPost(false)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {(searchQuery ? searchPosts(searchQuery) : getPostsByChannelId(selectedChannelId || '')).map((post) => (
              <div
                key={post.id}
                onClick={() => selectPost(post.id)}
                className="bg-white/10 rounded-lg p-6 space-y-4 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                    <p className="text-white/60 text-sm">
                      Posted by {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {post.isHighPriority && (
                      <AlertTriangle className="text-yellow-400" size={20} />
                    )}
                    {post.isPinned && (
                      <Pin className="text-white" size={20} />
                    )}
                    <MessageCircle className="text-white/60" size={20} />
                  </div>
                </div>
                <p className="text-white/80">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulletinBoard; 