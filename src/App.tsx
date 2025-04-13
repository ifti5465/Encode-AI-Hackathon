import React from "react";
import { Route, Routes } from "react-router-dom";
import { HelloWorld, Budgeting } from "./views";
import AboutUs from "./views/about_us";
import Registration from "./views/Registration";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HelloWorld />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/budgeting" element={<Budgeting />} />
      {/* Add more routes here as needed */}
    </Routes>
  );
};

export default App;
