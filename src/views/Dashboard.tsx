import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useUserStore } from "../stores/userStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, getUserById, users } = useUserStore();
  const userInfo = currentUser ? getUserById(currentUser) : null;

  const navigateToChores = () => {
    navigate("/chores");
  };

  const navigateToBudget = () => {
    navigate("/budget");
  };

  const navigateToBoard = () => {
    navigate("/board");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Header showHomeButton={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            {userInfo ? `Hi, ${userInfo.name}!` : 'Living Made Simple'}
          </h1>
          <p className="text-xl text-white/90 mt-2 max-w-2xl mx-auto">
            Your all-in-one solution for managing shared living spaces.
          </p>
        </div>
        
        {/* Modified modular dashboard layout - adjusted column widths */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Column - Navigation Items (now takes 3/5 of the space) */}
          <div className="md:col-span-3 space-y-6">
            {/* Column Label */}
            <h2 className="font-semibold text-white/90 text-sm tracking-wider uppercase mb-2 px-1">
              Manage Your Community
            </h2>
            
            {/* Chore Management Section */}
            <div
              className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition"
              onClick={navigateToChores}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  {/* Calendar with Tick Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
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
                <h3 className="text-xl font-semibold text-purple-700">Chore Management</h3>
              </div>
              <p className="text-gray-600">
                Never argue about whose turn it is to clean. Track and rotate chores effortlessly.
              </p>
            </div>

            {/* Money Management Section */}
            <div
              className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition"
              onClick={navigateToBudget}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  {/* Dollar Sign Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
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
                <h3 className="text-xl font-semibold text-purple-700">Money Management</h3>
              </div>
              <p className="text-gray-600">
                Split rent, utilities, and shared expenses fairly and transparently.
              </p>
            </div>

            {/* Bulletin Board Section */}
            <div
              className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition"
              onClick={navigateToBoard}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  {/* Bulletin Board Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
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
                <h3 className="text-xl font-semibold text-purple-700">Building Bulletin Board</h3>
              </div>
              <p className="text-gray-600">
                Post and view building-wide updates, maintenance notices, event alerts, and important announcements.
              </p>
            </div>
          </div>

          {/* Right Column - User Information (now takes 2/5 of the space) */}
          <div className="md:col-span-2 space-y-6">
            {/* Column Label */}
            <h2 className="font-semibold text-white/90 text-sm tracking-wider uppercase mb-2 px-1">
              Your Flat
            </h2>
            
            {/* Your Flatmates Section - Styled similar to original dashboard */}
            {userInfo && users.length > 1 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-medium text-white mb-4">Your Flatmates</h3>
                <div className="flex flex-wrap gap-3">
                  {users
                    .filter(user => user.id !== currentUser)
                    .map(user => (
                      <div key={user.id} className="flex items-center bg-white/10 px-3 py-2 rounded-lg">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-400/30 text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="ml-2 text-white">{user.name}</span>
                        <span className="ml-2 text-xs bg-purple-400/30 px-2 py-1 rounded-full text-white">
                          {user.points || 0} pts
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* User Stats and Leaderboard - Styled similar to original dashboard */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-medium text-white mb-4">User Stats</h3>
              {userInfo && (
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-400/30 text-white font-medium mr-3">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-white font-medium">{userInfo.name}</span>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-purple-400/30 px-2 py-1 rounded-full text-white">
                          {userInfo.points || 0} points
                        </span>
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                          Rank #{users.sort((a, b) => (b.points || 0) - (a.points || 0))
                            .findIndex(user => user.id === currentUser) + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {(userInfo.points || 0) >= 10 && (
                        <div className="bg-white/10 rounded-full px-3 py-1 text-xs text-white flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12l-8-8 1.5-1.5L10 9l6.5-6.5L18 4z" />
                          </svg>
                          Beginner
                        </div>
                      )}
                      {(userInfo.points || 0) >= 30 && (
                        <div className="bg-white/10 rounded-full px-3 py-1 text-xs text-white flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12l-8-8 1.5-1.5L10 9l6.5-6.5L18 4z" />
                          </svg>
                          Advanced
                        </div>
                      )}
                      {(userInfo.points || 0) >= 60 && (
                        <div className="bg-white/10 rounded-full px-3 py-1 text-xs text-white flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12l-8-8 1.5-1.5L10 9l6.5-6.5L18 4z" />
                          </svg>
                          Expert
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-1 text-white/80" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Flatmate Leaderboard
                </h4>
                <div className="space-y-2">
                  {users
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .slice(0, 5)
                    .map((user, index) => (
                      <div 
                        key={user.id} 
                        className={`flex items-center px-3 py-2 rounded-lg ${user.id === currentUser ? 'bg-white/20' : 'bg-white/10'}`}
                      >
                        <div className="mr-2 w-5 text-center font-medium text-white/90">
                          {index + 1}
                        </div>
                        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-400/30 text-white font-medium mr-2">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-white">{user.name}</span>
                        </div>
                        <div className="text-sm font-medium text-white">
                          {user.points || 0} pts
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

