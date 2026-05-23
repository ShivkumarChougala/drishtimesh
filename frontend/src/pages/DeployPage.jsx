import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MeshStats from "../components/MeshStats";
import TransparencySection from "../components/TransparencySection";
import LookupCTA from "../components/LookupCTA";
import RecentActivity from "../components/RecentActivity";
import Footer from "../components/Footer";
import { isLoggedIn } from "../api/auth";

export default function DeployPage() {
  const navigate = useNavigate();

  function handleDeploy() {
    if (isLoggedIn()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }

  return (
    <>
      <Navbar onDeploy={handleDeploy} />

      <main>
        <Hero onDeploy={handleDeploy} />
        <MeshStats />
	          <RecentActivity />
	  <TransparencySection />
        <LookupCTA onDeploy={handleDeploy} />
      </main>

      <Footer />
    </>
  );
}
