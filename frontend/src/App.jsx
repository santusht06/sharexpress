// Copyright 2026 Sharexpress

import { BrowserRouter } from "react-router-dom";
import LayoutWrapper from "./helpers/LayoutWrapper";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./store/slices/authSlice";
import { useEffect } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { connectSocket } from "./helpers/socket";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      const res = await dispatch(getCurrentUser());

      const user = res?.payload?.user;

      if (user?.user_id) {
        connectSocket(user.user_id, dispatch);
      }
    };

    init();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <LayoutWrapper />

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
