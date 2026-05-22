import { BrowserRouter, Routes, Route } from "react-router-dom";
import DeployPage from "./pages/DeployPage";
import LookupPage from "./pages/LookupPage";
import "./styles/deploy.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeployPage />} />
        <Route path="/lookup" element={<LookupPage />} />
      </Routes>
    </BrowserRouter>
  );
}
