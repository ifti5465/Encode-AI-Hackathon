import { useBulletinBoardStore } from '../stores/bulletinBoardStore';

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
  const { channels, addChannel } = useBulletinBoardStore.getState();
  
  // Only add default channels if none exist
  if (channels.length === 0) {
    DEFAULT_CHANNELS.forEach(channel => {
      addChannel(channel);
    });
  }
}; 