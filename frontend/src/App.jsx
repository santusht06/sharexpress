import { BrowserRouter } from "react-router-dom";
import LayoutWrapper from "./helpers/LayoutWrapper";

const App = () => {
  return (
    <BrowserRouter>
      <LayoutWrapper />
    </BrowserRouter>
  );
};

export default App;
