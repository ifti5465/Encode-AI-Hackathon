import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { createPortal } from 'react-dom';

interface HeaderProps {
  showDashboardButton?: boolean;
  showHomeButton?: boolean;
  showAuthButtons?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  showDashboardButton = false,
  showHomeButton = false,
  showAuthButtons = false,
}) => {
  const navigate = useNavigate();
  const { currentUser, getUserById, logout } = useUserStore();
  const userInfo = currentUser ? getUserById(currentUser) : null;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  // Create portal container on mount
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'menu-portal-container';
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Update menu position when button is clicked
  const updateMenuPosition = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      right: window.innerWidth - rect.right,
    });
    setShowUserMenu(prev => !prev);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const menu = document.getElementById('user-menu-dropdown');
        const button = document.getElementById('user-menu-button');
        if (menu && button && !menu.contains(event.target as Node) && !button.contains(event.target as Node)) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Close menu on navigation
  const handleLogout = useCallback(() => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  const navigateTo = useCallback((path: string) => {
    setShowUserMenu(false);
    navigate(path);
  }, [navigate]);

  // Dropdown menu portal
  const MenuDropdown = () => {
    if (!showUserMenu || !userInfo || !portalContainer) return null;

    return createPortal(
      <div
        id="user-menu-dropdown"
        className="fixed py-2 bg-white/10 backdrop-blur-md rounded-md border border-white/20 shadow-xl"
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
          width: '12rem',
          zIndex: 9999,
        }}
      >
        <div className="px-4 py-2 text-sm text-white border-b border-white/10">
          <div className="font-medium">{userInfo.name}</div>
          <div className="text-white/70 truncate">{userInfo.email}</div>
        </div>
        <button
          onClick={() => navigateTo('/dashboard')}
          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigateTo('/chores')}
          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
        >
          Chores
        </button>
        <button
          onClick={() => navigateTo('/budget')}
          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
        >
          Budget
        </button>
        <button
          onClick={() => navigateTo('/board')}
          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
        >
          Bulletin Board
        </button>
        <div className="border-t border-white/10 mt-2 pt-2">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
          >
            Sign Out
          </button>
        </div>
      </div>,
      portalContainer
    );
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              onClick={() => currentUser ? navigate('/dashboard') : navigate('/')}
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
            <span 
              className="ml-2 text-3xl font-extrabold text-white tracking-wide cursor-pointer" 
              onClick={() => currentUser ? navigate('/dashboard') : navigate('/')}
            >
              flatmade
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {!currentUser && showAuthButtons && (
              <>
                <button
                  onClick={() => navigate('/about')}
                  className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  About Us
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Register
                </button>
              </>
            )}

            {currentUser && userInfo && (
              <div className="relative">
                <button
                  id="user-menu-button"
                  onClick={updateMenuPosition}
                  className="flex items-center space-x-2 text-white hover:bg-white/10 px-3 py-2 rounded-md transition"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-400/30 flex items-center justify-center text-white font-bold">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{userInfo.name}</span>
                </button>
                <MenuDropdown />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header; 