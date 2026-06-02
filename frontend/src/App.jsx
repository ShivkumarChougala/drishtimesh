import { BrowserRouter, Routes, Route } from "react-router-dom";

import DeployPage from "./pages/DeployPage";
import LookupPage from "./pages/LookupPage";
import WhyDrishtiMeshPage from "./pages/WhyDrishtiMeshPage";
import LoginPage from "./pages/LoginPage";
import AuthGatePage from "./pages/AuthGatePage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
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
        <Route path="/why-drishtimesh" element={<WhyDrishtiMeshPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/login" element={<AuthGatePage />} />
        <Route path="/login/form" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
