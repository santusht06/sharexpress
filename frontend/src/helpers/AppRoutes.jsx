import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/TermsOfServicePage";
import SecurityPolicyPage from "../pages/SecurityPolicyPage";
import Signin from "../pages/Signin";
import Dashboard from "../pages/Dashboard";
import NotFound from "../components/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/security" element={<SecurityPolicyPage />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
