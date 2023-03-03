import React from "react";
import { Route, Router, Routes } from "react-router-dom";
import DocEditor from "./Components/DocEditor";
import Documentation from "./Pages/Documentation";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DocEditor />} />
        <Route path="/:id" element={<Documentation />} />
      </Routes>
    </>
  );
};

export default App;
