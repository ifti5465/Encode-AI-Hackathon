import React from "react";
import { Route, Routes } from "react-router-dom";
import { HelloWorld } from "./views";
import AboutUs from "./views/about_us";
import Registration from "./views/Registration";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HelloWorld />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/registration" element={<Registration />} />
      {/* Add more routes here as needed */}
    </Routes>
  );
};

export default App;
