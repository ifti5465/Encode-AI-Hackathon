import React from "react";
import { Route, Routes } from "react-router-dom";
import { Chores } from "../views";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Chores />} />
    </Routes>
  );
};

export default App;
