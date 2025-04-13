import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Main, About, Registration, Login, Dashboard, Chores, Budget, BulletinBoard } from "./views";
import { useUserStore } from "./stores/userStore";

// Auth provider component to handle app-wide authentication
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUserStore();
  const navigate = useNavigate();

  // Redirect to login if no user is authenticated for protected routes
  useEffect(() => {
    const path = window.location.pathname;
    const publicRoutes = ['/', '/about', '/register', '/login'];
    
    // If the user is not logged in and tries to access a protected route, redirect to login
    if (!currentUser && !publicRoutes.includes(path)) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/chores" element={<Chores />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/board" element={<BulletinBoard />} />
        {/* Add more routes here as needed */}
      </Routes>
    </AuthProvider>
  );
};

export default App;