import React from "react";
import { Route, Routes } from "react-router-dom";
import { Main, About, Registration, Login, Dashboard, Chores, Budget } from "./views";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/about" element={<About />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/chores" element={<Chores />} />
      <Route path="/budget" element={<Budget />} />
      {/* Add more routes here as needed */}
    </Routes>
  );
};

export default App;
