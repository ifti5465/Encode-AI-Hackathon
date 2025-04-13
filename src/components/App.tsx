import React from "react";
import { Route, Routes } from "react-router-dom";
import { ChoreList } from "./views";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ChoreList />} />
    </Routes>
  );
};

export default App;
