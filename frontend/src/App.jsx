import { BrowserRouter } from "react-router-dom";
import LayoutWrapper from "./helpers/LayoutWrapper";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./store/slices/authSlice";
import { useEffect } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, []);

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
