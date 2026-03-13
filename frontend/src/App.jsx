// Copyright 2026 Sharexpress
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
//
import { BrowserRouter } from "react-router-dom";
import LayoutWrapper from "./helpers/LayoutWrapper";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./store/slices/authSlice";
import { useEffect } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectSocket } from "./lib/socket";
import SessionRequestCard from "./components/Dashboard/SessionRequestCard";
const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
    connectSocket(dispatch);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <LayoutWrapper />
      <SessionRequestCard />
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        draggable
        theme="dark"
        transition={Slide}
      />
    </BrowserRouter>
  );
};

export default App;
