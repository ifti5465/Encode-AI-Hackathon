import { useBulletinBoardStore } from '../stores/bulletinBoardStore';
import { useUserStore } from '../stores/userStore';

const DEFAULT_CHANNELS = [
  {
    name: 'Maintenance & Building Notices',
    description: 'Important updates about building maintenance and facilities',
    emoji: '🔧',
    isStaffOnly: true
  },
  {
    name: 'Events',
    description: 'Upcoming events and activities in the building',
    emoji: '📢',
    isStaffOnly: false
  },
  {
    name: 'Marketplace',
    description: 'Buy, sell, or give away items with your neighbors',
    emoji: '🛍️',
    isStaffOnly: false
  },
  {
    name: 'General Chat',
    description: 'General discussion and questions',
    emoji: '💬',
    isStaffOnly: false
  },
  {
    name: 'Chores & Housekeeping',
    description: 'Discussions about cleaning and household chores',
    emoji: '🧼',
    isStaffOnly: false
  }
];

export const initializeBulletinBoard = () => {
  // Get store state and actions
  const bulletinStore = useBulletinBoardStore.getState();
  const { channels, posts, addChannel, addPost } = bulletinStore;
  
  // Only add default channels if none exist
  if (channels.length === 0) {
    DEFAULT_CHANNELS.forEach(channel => {
      addChannel(channel);
    });
    
    // After channels are created, check if we need to add a welcome post
    // This will run after the addChannel calls have updated the state
    setTimeout(() => {
      const updatedChannels = useBulletinBoardStore.getState().channels;
      const updatedPosts = useBulletinBoardStore.getState().posts;
      
      // Only add a welcome post if there are no posts yet
      if (updatedPosts.length === 0 && updatedChannels.length > 0) {
        // Get current user info for the welcome post
        const userStore = useUserStore.getState();
        const currentUser = userStore.currentUser;
        
        // Use the general chat channel for the welcome post
        const generalChannel = updatedChannels.find(c => c.name === 'General Chat');
        
        if (generalChannel && currentUser) {
          const userInfo = userStore.getUserById(currentUser);
          
          if (userInfo) {
            addPost(
              generalChannel.id,
              'Welcome to the Bulletin Board!',
              'This is where you can communicate with your flatmates. Feel free to post messages, announcements, and more.',
              currentUser,
              userInfo.name,
              false
            );
          }
        }
      }
    }, 100); // Small delay to ensure channels are created first
  }
}; 