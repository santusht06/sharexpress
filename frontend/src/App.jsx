import React from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <>
      <Navbar />
      <div className=" min-h-screen min-w-screen bg-black  px-40 py-5  ">
        <Home />
      </div>
    </>
  );
};

export default App;
