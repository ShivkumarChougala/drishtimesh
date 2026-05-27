import Navbar from "../components/Navbar";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import FaultyTerminal from "../components/backgrounds/FaultyTerminal";

import "../styles/why-drishtimesh.css";

export default function WhyDrishtiMeshPage() {
  return (
    <>
      <Navbar />
      <AnnouncementBar />

      <main className="why-page">
        <section className="why-page-hero">
          <div className="why-terminal-bg">
            <FaultyTerminal
              scale={2.1}
              gridMul={[3, 2]}
              digitSize={1.45}
              timeScale={0.14}
              pause={false}
              scanlineIntensity={0.1}
              glitchAmount={0.12}
              flickerAmount={0.12}
              noiseAmp={1}
              chromaticAberration={0}
              dither={0}
              curvature={0}
              tint="#78d6a3"
              mouseReact={true}
              mouseStrength={1.2}
              pageLoadAnimation={false}
              brightness={3.1}
            />
          </div>

          <div className="why-overlay"></div>

          <div className="why-page-content">
            <div className="section-kicker">
              OUR MISSION
            </div>

            <h1>
              Every shared signal helps the community build better reputation intelligence.
            </h1>

            <p className="why-description">
              Attacks happen across the internet every day. By sharing signals
              from community-deployed sensors, DrishtiMesh helps the community
              recognize suspicious activity and improve threat visibility
              together in real time.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
