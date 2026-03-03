import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnimatedRoutes from "./helpers/AnimatedRoutes";
import ScrollToTop from "./helpers/ScrollToTop";

const App = () => {
  return (
    <>
      <ScrollToTop />

      <Navbar />

      <AnimatedRoutes />

      <Footer />
    </>
  );
};

export default App;
