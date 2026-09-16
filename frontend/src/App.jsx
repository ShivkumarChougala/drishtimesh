import { BrowserRouter, Routes, Route } from "react-router-dom";

import DeployPage from "./pages/DeployPage";
import LookupPage from "./pages/LookupPage";
import LoginPage from "./pages/LoginPage";
import AuthGatePage from "./pages/AuthGatePage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardDeployPage from "./pages/DashboardDeployPage";
import SignalsPage from "./pages/SignalsPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import ScrollToTop from "./components/ScrollToTop";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

import "./styles/deploy.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/blog.css";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<DeployPage />} />
        <Route path="/lookup" element={<LookupPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/login" element={<AuthGatePage />} />
        <Route path="/login/form" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/signals" element={<SignalsPage />} />
        <Route path="/dashboard/deploy" element={<DashboardDeployPage />} />
        <Route path="/dashboard/settings" element={<AccountSettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
