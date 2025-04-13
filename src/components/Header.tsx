import React from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-8 w-8 text-white ${showHomeButton ? 'cursor-pointer' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              onClick={showHomeButton ? () => navigate('/') : undefined}
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
          <div className="flex items-center space-x-4">
            {showAuthButtons && (
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
            {showDashboardButton && (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header; 