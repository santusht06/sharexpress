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
import { useEffect, useRef } from "react";
import { ToastContainer, Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GenerateQRCode } from "./store/slices/QrSlice";
import { connectSocket } from "../src/helpers/socket";
const App = () => {
  const dispatch = useDispatch();
  const hasGenerated = useRef(false);

  useEffect(() => {
    dispatch(getCurrentUser());

    const call_QR = async () => {
      if (hasGenerated.current) return;

      hasGenerated.current = true;
      const res = await dispatch(GenerateQRCode())
        .unwrap()
        .catch(() => {
          toast.error("Failed to generate QR");
        });

      connectSocket(res.qr_id || null, dispatch);

      return res;
      c;
    };

    call_QR();
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
