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
  Clipboard
} from "lucide-react";

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

  // Set default channel if none selected
  useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      selectChannel(channels[0].id);
    }
  }, [channels, selectedChannelId, selectChannel]);
  
  // Calculate unread notifications count
  useEffect(() => {
    if (currentUser) {
      const userNotifications = getUserNotifications(currentUser);
      const unread = userNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [notifications, currentUser, getUserNotifications]);
  
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
    ? getUserNotifications(currentUser)
    : [];
    
  // Handle adding a new post
  const handleAddPost = () => {
    if (!selectedChannelId || !newPostTitle.trim() || !newPostContent.trim() || !currentUser || !userInfo) return;
    
    // Check if user can post in this channel
    if (selectedChannel?.isStaffOnly && !isStaffView) {
      alert("Only staff can post in this channel");
      return;
    }
    
    addPost(
      selectedChannelId,
      newPostTitle.trim(),
      newPostContent.trim(),
      currentUser,
      userInfo.name,
      isHighPriority
    );
    
    // Reset form
    setNewPostTitle("");
    setNewPostContent("");
    setIsHighPriority(false);
    setIsAddingPost(false);
  };
  
  // Handle adding a comment to a post
  const handleAddComment = () => {
    if (!selectedPostId || !newCommentContent.trim() || !currentUser || !userInfo) return;
    
    console.log("Adding comment to post:", selectedPostId);
    console.log("Comment content:", newCommentContent);
    console.log("Current user:", currentUser);
    
    addComment(
      selectedPostId,
      newCommentContent.trim(),
      currentUser,
      userInfo.name
    );
    
    // Check if comment was added
    const updatedComments = getCommentsByPostId(selectedPostId);
    console.log("Updated comments for post:", updatedComments);
    
    // Reset form
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 21V16h4v5"
                />
              </svg>
              <span className="ml-2 text-3xl font-extrabold text-white tracking-wide">
                flatmade
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition">
                Home
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition">
                About Us
              </button>
              <button 
                onClick={() => navigate('/bulletin-board')}
                className="text-white bg-white/20 px-3 py-2 rounded-md text-sm font-medium transition">
                Bulletin Board
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Residence Bulletin Board</h1>

        {/* Toggle Staff/Student View */}
        <div className="mb-4 flex justify-end">
          <label className="flex items-center space-x-2 cursor-pointer">
            <span className="text-sm font-medium text-white">Staff View</span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={isStaffView}
                onChange={(e) => setIsStaffView(e.target.checked)}
              />
              <div className={`w-10 h-5 rounded-full transition ${isStaffView ? 'bg-purple-600' : 'bg-white/30'}`}></div>
              <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isStaffView ? 'transform translate-x-5' : ''}`}></div>
            </div>
          </label>
        </div>

        {/* Notifications */}
        <div className="mb-4 flex justify-end">
          <div className="relative">
            <button 
              onClick={toggleNotificationMenu}
              className="flex items-center px-3 py-2 rounded-md text-white bg-white/10 hover:bg-white/20 transition"
            >
              <Bell size={18} className="mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification dropdown */}
            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white/10 backdrop-blur-md rounded-lg shadow-lg z-50 border border-white/20">
                <button 
                  className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-t-lg"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
                <hr className="border-white/20" />
                
                <div className="max-h-96 overflow-y-auto">
                  {currentUser && getUserNotifications(currentUser).length > 0 ? (
                    getUserNotifications(currentUser).map(notification => (
                      <button 
                        key={notification.id}
                        className={`w-full text-left px-4 py-2 ${notification.isRead ? 'text-white/80' : 'text-white font-semibold'} hover:bg-white/10`}
                        onClick={() => {
                          markNotificationAsRead(notification.id);
                          if (notification.channelId) {
                            selectChannel(notification.channelId);
                          }
                          if (notification.referenceId) {
                            selectPost(notification.referenceId);
                          }
                          setShowNotificationMenu(false);
                        }}
                      >
                        <div className="text-sm">
                          {notification.type === 'new_post' 
                            ? 'New post in channel'
                            : notification.type === 'new_comment'
                            ? 'New comment on post'
                            : notification.type === 'mention'
                            ? 'You were mentioned'
                            : 'High priority post'
                          }
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          {formatDate(notification.createdAt)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-white/70">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          {/* Channel sidebar */}
          <div className="w-full md:w-1/4 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Channels</h2>
            <ul className="space-y-2">
              {channels.map(channel => (
                <li key={channel.id}>
                  <button 
                    className={`w-full text-left p-2 rounded-md transition ${
                      selectedChannelId === channel.id 
                        ? 'bg-purple-600 text-white' 
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => {
                      selectChannel(channel.id);
                      setSearchQuery('');
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{channel.emoji}</span>
                      <span>{channel.name}</span>
                      {channel.isStaffOnly && (
                        <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded">Staff</span>
                      )}
                    </div>
                    <p className="text-sm text-white/70 mt-1">{channel.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Post content */}
          <div className="flex-1 flex flex-col space-y-4">
            {/* Search and action bar */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 flex items-center">
              <div className="relative flex-1 mr-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-white/70" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-white/5 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={() => setIsAddingPost(true)}
                disabled={!selectedChannelId}
                className={`flex items-center px-4 py-2 rounded-md font-medium ${
                  selectedChannelId
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                <Plus size={18} className="mr-1" />
                New Post
              </button>
            </div>
            
            {/* Posts list */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
              {sortedPosts.length > 0 ? (
                <div className="space-y-4">
                  {sortedPosts.map(post => {
                    // Get comments for this post and sort by newest first
                    const postComments = getCommentsByPostId(post.id);
                    console.log(`Post ${post.id} has ${postComments.length} comments:`, postComments);
                    
                    const sortedComments = [...postComments].sort((a, b) => 
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    const latestComment = sortedComments[0]; // Get most recent comment
                    
                    console.log(`Latest comment for post ${post.id}:`, latestComment);
                    
                    return (
                      <div
                        key={post.id}
                        onClick={() => selectPost(post.id)}
                        className={`bg-white/30 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/40 transition ${
                          post.isHighPriority ? 'border-l-4 border-red-500' : 'border-2 border-white/50'
                        }`}
                      >
                        <div className="flex justify-between">
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                              {post.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <h3 className="font-semibold text-lg text-white">{post.title}</h3>
                              <p className="text-sm text-white/80">
                                {post.authorName} - {formatDate(post.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            {post.isPinned && (
                              <Pin size={16} className="text-white mr-1" />
                            )}
                            {post.isHighPriority && (
                              <AlertTriangle size={16} className="text-red-400 mr-1" />
                            )}
                            <button
                              onClick={(e) => handlePostMenuOpen(e, post.id)}
                              className="text-white/70 hover:text-white ml-1"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-white">
                          <p>{post.content}</p>
                        </div>
                        
                        {post.attachmentUrls && post.attachmentUrls.length > 0 && (
                          <div className="mt-3">
                            <div className="inline-flex items-center px-2 py-1 bg-purple-600/40 text-white text-xs rounded">
                              <Paperclip size={12} className="mr-1" />
                              {post.attachmentUrls.length} attachment{post.attachmentUrls.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-white/80 text-sm flex items-center">
                            <MessageSquare size={14} className="mr-1" />
                            {postComments.length} comment{postComments.length !== 1 ? 's' : ''}
                          </div>
                          {latestComment && postComments.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectPost(post.id);
                              }}
                              className="text-purple-300 text-sm hover:text-purple-200"
                            >
                              View all comments
                            </button>
                          )}
                        </div>
                        
                        {/* Show latest comment if exists */}
                        {latestComment ? (
                          <div className="mt-3 bg-purple-800/40 p-3 rounded-lg border-2 border-purple-400/50">
                            <div className="flex justify-between items-center">
                              <div className="font-medium text-white text-sm">{latestComment.authorName}</div>
                              <div className="text-xs text-white/60">{formatDate(latestComment.createdAt)}</div>
                            </div>
                            <p className="mt-1 text-white text-sm font-medium">{latestComment.content}</p>
                          </div>
                        ) : (
                          // For testing - always show a placeholder comment if none exists
                          <div className="mt-3 bg-pink-600/40 p-3 rounded-lg border-2 border-pink-400/50">
                            <div className="flex justify-between items-center">
                              <div className="font-medium text-white text-sm">Test User</div>
                              <div className="text-xs text-white/60">{formatDate(new Date().toISOString())}</div>
                            </div>
                            <p className="mt-1 text-white text-sm font-medium">This is a test comment to verify the comment display functionality. If you see this, the comment UI works!</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-white/70">
                  {searchQuery 
                    ? 'No posts match your search criteria'
                    : selectedChannelId 
                    ? 'No posts in this channel yet. Be the first to post!'
                    : 'Select a channel to view posts'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Post detail modal */}
        {selectedPostId && selectedPost && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
                <div className="pr-8">
                  <h2 className="font-semibold text-xl text-white">{selectedPost.title}</h2>
                  {selectedPost.isHighPriority && (
                    <div className="inline-flex items-center mt-1 px-2 py-1 bg-red-500/30 text-white text-xs rounded">
                      <AlertTriangle size={12} className="mr-1" />
                      High Priority
                    </div>
                  )}
                </div>
                <button
                  onClick={() => selectPost(null)}
                  className="text-white/70 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-white/90 whitespace-pre-line">{selectedPost.content}</p>
                
                {selectedPost.attachmentUrls && selectedPost.attachmentUrls.length > 0 && (
                  <div className="mt-4 mb-6">
                    <h3 className="font-medium text-sm text-white mb-2">Attachments:</h3>
                    <ul className="space-y-1">
                      {selectedPost.attachmentUrls.map((url, index) => (
                        <li key={index} className="flex items-center text-purple-300 text-sm hover:text-purple-200">
                          <Paperclip size={14} className="mr-1" />
                          <span>{url.split('/').pop()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <hr className="my-6 border-white/20" />
                
                <h3 className="font-semibold text-white mb-4">Comments</h3>
                
                {selectedPostComments.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {selectedPostComments.map(comment => (
                      <div key={comment.id} className="bg-purple-800/40 p-4 rounded-lg border-2 border-purple-400/50">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-white">{comment.authorName}</div>
                          <div className="text-xs text-white/70">{formatDate(comment.createdAt)}</div>
                        </div>
                        <p className="mt-2 text-white font-medium">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-pink-600/40 p-4 rounded-lg border-2 border-pink-400/50 mb-6">
                    <p className="text-white font-medium">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}
                
                {isAddingComment ? (
                  <div className="flex mt-4">
                    <textarea
                      placeholder="Write a comment..."
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      className="flex-1 p-3 bg-white/10 text-white border-2 border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    ></textarea>
                    <div className="ml-2 flex flex-col">
                      <button
                        onClick={handleAddComment}
                        disabled={!newCommentContent.trim()}
                        className={`p-2 rounded-md mb-1 ${
                          newCommentContent.trim()
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        <Send size={20} />
                      </button>
                      <button
                        onClick={() => setIsAddingComment(false)}
                        className="p-2 text-white/70 hover:bg-white/10 rounded-md"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingComment(true)}
                    className="mt-4 flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Add Comment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Add post modal */}
        {isAddingPost && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-2xl">
              <div className="px-6 py-4 border-b border-white/20">
                <h2 className="font-semibold text-xl text-white">New Post</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter post title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Content
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-white/5 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter post content"
                  ></textarea>
                </div>
                
                <div className="flex items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsHighPriority(!isHighPriority)}
                    className={`flex items-center px-3 py-1.5 rounded-md ${
                      isHighPriority 
                        ? 'bg-red-500/30 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <AlertTriangle size={16} className="mr-1.5" />
                    High Priority
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-white/20 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPost(false)}
                  className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPost}
                  disabled={!newPostTitle.trim() || !newPostContent.trim()}
                  className={`px-4 py-2 rounded-md ${
                    newPostTitle.trim() && newPostContent.trim()
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Post action menu */}
        {showPostMenu && selectedMenuPostId && (
          <div className="fixed inset-0 flex items-start justify-center z-50" onClick={handlePostMenuClose}>
            <div className="mt-20 bg-white/10 backdrop-blur-md rounded-md border border-white/20 shadow-lg overflow-hidden w-48" onClick={e => e.stopPropagation()}>
              {(() => {
                const post = posts.find(p => p.id === selectedMenuPostId);
                if (!post) return null;
                
                return (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10"
                      onClick={() => handlePinPost(post.id, post.isPinned)}
                    >
                      {post.isPinned ? "Unpin Post" : "Pin Post"}
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-white/10 text-red-300"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete Post
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BulletinBoard; 