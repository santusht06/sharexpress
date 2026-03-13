// Copyright 2026 Sharexpress

import { BrowserRouter } from "react-router-dom";
import LayoutWrapper from "./helpers/LayoutWrapper";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./store/slices/authSlice";
import { useEffect } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectSocket } from "./lib/socket";
import { checkSession } from "./store/slices/ShareSessionSlice";
import SessionRequestCard from "./components/Dashboard/SessionRequestCard";
const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser()).then((res) => {
      const user_id = res.payload.user.user_id;

      connectSocket(user_id, dispatch);
    });

    dispatch(checkSession());
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
