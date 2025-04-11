import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-800 to-black text-white font-sans">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Wrap House Icon and flatmade in Link */}
              <Link to="/" className="flex items-center">
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
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* About Us Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-8">
            About Us
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            We are a group of university students who faced the common problem
            of disorganization while living with flatmates. From managing chores
            to splitting bills, we realized the need for a simple and effective
            solution to make shared living easier and more harmonious.
          </p>
        </div>

        {/* Founders Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="bg-purple-700/30 backdrop-blur-md p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">Ifti Ahmed</h3>
            <p className="text-gray-300 text-lg">Role: Frontend Developer</p>
          </div>
          <div className="bg-purple-700/30 backdrop-blur-md p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">Zain Ahmed</h3>
            <p className="text-gray-300 text-lg">Role: Backend Developer</p>
          </div>
          <div className="bg-purple-700/30 backdrop-blur-md p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">Corinne</h3>
            <p className="text-gray-300 text-lg">Frontend Developer</p>
          </div>
          <div className="bg-purple-700/30 backdrop-blur-md p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">Mehdi</h3>
            <p className="text-gray-300 text-lg">Backend Developer</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;