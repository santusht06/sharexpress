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
