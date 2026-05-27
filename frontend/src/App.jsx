import { BrowserRouter, Routes, Route } from "react-router-dom";

import DeployPage from "./pages/DeployPage";
import LookupPage from "./pages/LookupPage";
import WhyDrishtiMeshPage from "./pages/WhyDrishtiMeshPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";

import "./styles/deploy.css";
import "./styles/auth.css";
import "./styles/dashboard.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeployPage />} />
        <Route path="/lookup" element={<LookupPage />} />
        <Route path="/why-drishtimesh" element={<WhyDrishtiMeshPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
