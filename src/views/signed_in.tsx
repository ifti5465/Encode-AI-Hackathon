import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SignedIn = () => {
  const navigate = useNavigate();

  const navigateToChores = () => {
    navigate("/chores"); // Navigate to the chores page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Updated Home Icon with Shorter Door */}
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
            <div className="flex items-center space-x-2">
              {/* Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm6 0c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm-6 8c-2.667 0-8 1.333-8 4v1h16v-1c0-2.667-5.333-4-8-4z"
                />
              </svg>
              <span className="text-3xl font-extrabold text-white tracking-wide">
                hi user
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-8">
            Living Made Simple
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Your all-in-one solution for managing shared living spaces. From chores to bills,
            make roommate life easier and more organized.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {/* Chore Management Section */}
          <div
            className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 cursor-pointer hover:bg-white/20 transition"
            onClick={navigateToChores}
          >
            <div className="h-12 w-12 bg-purple-400/20 rounded-lg flex items-center justify-center mb-4">
              {/* Calendar with Tick Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10m-9 4h4m-6 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 13l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chore Management</h3>
            <p className="text-white/80">
              Never argue about whose turn it is to clean. Track and rotate chores effortlessly.
            </p>
          </div>

          {/* Other Features */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <div className="h-12 w-12 bg-purple-400/20 rounded-lg flex items-center justify-center mb-4">
              {/* Dollar Sign Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Bill Splitting</h3>
            <p className="text-white/80">
              Split rent, utilities, and shared expenses fairly and transparently.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <div className="h-12 w-12 bg-purple-400/20 rounded-lg flex items-center justify-center mb-4">
              {/* Refrigerator Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm8 10h.01M9 10h.01M9 14h6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Space Management</h3>
            <p className="text-white/80">
              Organize shared spaces like fridges and storage areas with clear boundaries.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignedIn;

