import React from "react";

const HelloWorld = () => {
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
              <span className="ml-2 text-2xl font-bold text-white">flatmade</span>
            </div>
            <div className="flex space-x-4">
              <button className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition">
                About Us
              </button>
              <button className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition">
                Help
              </button>
              <button className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition">
                Sign In
              </button>
              <button className="bg-white text-purple-600 hover:bg-white/90 px-4 py-2 rounded-md text-sm font-medium transition">
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-8">
            Harmonious Living Made Simple
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Your all-in-one solution for managing shared living spaces. From chores to bills,
            make roommate life easier and more organized.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
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
                  d="M12 8c-4.418 0-8 1.79-8 4s3.582 4 8 4 8-1.79 8-4-3.582-4-8-4zm0 0V4m0 16v-4"
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

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button className="bg-white text-purple-600 hover:bg-white/90 px-8 py-3 rounded-full text-lg font-medium transition">
            Get Started Today
          </button>
        </div>
      </main>
    </div>
  );
};

export default HelloWorld;
