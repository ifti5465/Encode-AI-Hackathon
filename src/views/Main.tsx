import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useUserStore } from "../stores/userStore";

const Main = () => {
  const navigate = useNavigate();
  const { currentUser, getUserById } = useUserStore();
  const userInfo = currentUser ? getUserById(currentUser) : null;

  // Automatically redirect to dashboard if user is logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleAboutClick = () => {
    navigate('/about');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  // If user is logged in, this will briefly show before redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Use the Header component with appropriate props */}
      <Header showAuthButtons={!currentUser} showDashboardButton={false} />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {userInfo ? (
            <div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                Redirecting to Dashboard...
              </h1>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-8">
                Living Made Simple
              </h1>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                Your all-in-one solution for managing shared living spaces. From chores to bills,
                make roommate life easier and more organised.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <button
                  onClick={handleRegisterClick}
                  className="px-8 py-3 bg-white text-purple-600 rounded-lg shadow-lg hover:bg-white/90 transition font-medium text-lg w-full sm:w-auto"
                >
                  Get Started
                </button>
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-3 bg-transparent border border-white text-white rounded-lg hover:bg-white/10 transition font-medium text-lg w-full sm:w-auto"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Only show features grid if not logged in */}
        {!currentUser && (
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 flex flex-col items-center text-center">
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

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 flex flex-col items-center text-center">
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
              <h3 className="text-xl font-semibold text-white mb-2">Money Management</h3>
              <p className="text-white/80">
                Split rent, utilities, and shared expenses fairly and transparently, or track your spending with fun challenges.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-purple-400/20 rounded-lg flex items-center justify-center mb-4">
                {/* Bulletin Board Icon */}
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
              <h3 className="text-xl font-semibold text-white mb-2">Building Bulletin Board</h3>
              <p className="text-white/80">
              Post and view building-wide updates, maintenance notices, event alerts, and important announcements.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Main;

