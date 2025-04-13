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

export const initializeBulletinBoard = async () => {
  // Get store state and actions
  const bulletinStore = useBulletinBoardStore.getState();
  const { channels, posts, addChannel, addPost } = bulletinStore;
  
  // Only add default channels if none exist
  if (channels.length === 0) {
    // Add channels sequentially to prevent race conditions
    for (const channel of DEFAULT_CHANNELS) {
      await addChannel(channel);
    }
    
    // Get updated state after channels are created
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
          await addPost(
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
  }
}; 