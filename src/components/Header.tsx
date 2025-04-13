import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

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

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  // Navigate directly to a specific page
  const navigateTo = (path: string) => {
    navigate(path);
    setShowUserMenu(false); // Close menu if open
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
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
            {/* Show auth buttons if not logged in and showAuthButtons is true */}
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

            {/* User profile menu if logged in */}
            {currentUser && userInfo && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:bg-white/10 px-3 py-2 rounded-md transition"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-400/30 flex items-center justify-center text-white font-bold">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{userInfo.name}</span>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white/10 backdrop-blur-md rounded-md border border-white/20 shadow-xl z-10">
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header; 