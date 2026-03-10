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
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AppRoutes from "./AppRoutes";
import ScrollToTop from "../helpers/ScrollToTop";

const LayoutWrapper = () => {
  const location = useLocation();

  const hideLayout =
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/signin" ||
    !["/", "/privacy", "/terms", "/security", "/signin", "/dashboard"].some(
      (path) => location.pathname.startsWith(path),
    );

  return (
    <>
      <ScrollToTop />

      {!hideLayout && <Navbar />}
      <AppRoutes />
      {!hideLayout && <Footer />}
    </>
  );
};

export default LayoutWrapper;
