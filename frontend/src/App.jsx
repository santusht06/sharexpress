import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AnimatedRoutes from "./helpers/AnimatedRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./helpers/ScrollToTop";
import SmoothScroll from "./lib/SmoothScroll";

const LayoutWrapper = () => {
  const location = useLocation();

  const hideLayout = location.pathname === "/signin";

  return (
    <>
      {!hideLayout && <Navbar />}

      <AnimatedRoutes />

      {!hideLayout && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LayoutWrapper />
    </BrowserRouter>
  );
};

export default App;
