import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

const Login = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Get store actions and state
  const { loginUser, clearError } = useUserStore();
  const { isLoading, error } = useUserStore();

  // Clear any store errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Basic validation
    if (!formData.email || !formData.password) {
      useUserStore.setState({ error: "All fields are required" });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      useUserStore.setState({ error: "Please enter a valid email address" });
      return;
    }

    try {
      // Attempt to login
      await loginUser(formData.email, formData.password);
      
      // If successful, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              {/* Home Icon */}
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="mt-2 text-white/80">Log in to manage your shared living space</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-400/20 border border-red-400/30 text-red-100 rounded-md backdrop-blur-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-white font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-white text-purple-600 py-3 px-4 rounded-md font-medium hover:bg-white/90 transition
                  ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <button 
                onClick={() => navigate('/register')}
                className="text-white/80 hover:text-white transition block w-full"
              >
                Don't have an account? Sign up
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-white/80 hover:text-white transition block w-full"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
