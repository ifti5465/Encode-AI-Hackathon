import React from "react";
import { Route, Routes } from "react-router-dom";
import { HelloWorld } from "./views";
import AboutUs from "./views/about_us";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HelloWorld />} />
      <Route path="/about" element={<AboutUs />} />
    </Routes>
  );
};

export default App;
