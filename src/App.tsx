import React from "react";
import { Route, Routes } from "react-router-dom";
import { HelloWorld } from "./views";
import Registration from "./views/Registration";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HelloWorld />} />
      <Route path="/registration" element={<Registration />} />
      {/* Add more routes here as needed */}
    </Routes>
  );
};

export default App;
