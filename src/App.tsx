import React from "react";
import { Route, Routes } from "react-router-dom";
import { HelloWorld, Budgeting } from "./views";
import AboutUs from "./views/about_us";
import Registration from "./views/Registration";
import Login from "./views/Login";
import ChoreList from "./views/ChoreList";
import SignedIn from "./views/signed_in"; // Import the SignedIn component

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HelloWorld />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chores" element={<ChoreList />} />
      <Route path="/signed_in" element={<SignedIn/>} /> {/* Add SignedIn route */}
      {/* Add more routes here as needed */}
    </Routes>
  );
};

export default App;
