import { useState } from "react";

import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MeshStats from "../components/MeshStats";
import RecentActivity from "../components/RecentActivity";
import TransparencySection from "../components/TransparencySection";
import DeployTerminal from "../components/DeployTerminal";
import DeployDocs from "../components/DeployDocs";
import LookupCTA from "../components/LookupCTA";
import Footer from "../components/Footer";
import DeploySensorModal from "../components/DeploySensorModal";

export default function DeployPage() {
  const [deployOpen, setDeployOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />
      <Navbar onDeploy={() => setDeployOpen(true)} />

      <main>
        <Hero onDeploy={() => setDeployOpen(true)} />
        <MeshStats />
        <RecentActivity />
        <TransparencySection />
        <DeployTerminal />
        <DeployDocs />
        <LookupCTA onDeploy={() => setDeployOpen(true)} />
      </main>

      <Footer />

      <DeploySensorModal
        open={deployOpen}
        onClose={() => setDeployOpen(false)}
      />
    </>
  );
}
