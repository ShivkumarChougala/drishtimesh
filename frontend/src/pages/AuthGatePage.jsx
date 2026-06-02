import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnnouncementBar from "../components/AnnouncementBar";

export default function AuthGatePage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="auth-gate-page">
        <section className="auth-gate-card">
          <div className="auth-badge">DrishtiMesh Community</div>

          <h1>Sign in to continue</h1>

          <p>
            Access your sensor dashboard, manage deployed nodes, monitor threat
            activity, and contribute signals to the DrishtiMesh network.
          </p>

          <div className="auth-gate-actions">
            <Link to="/signup" className="auth-gate-primary">
              Create Free Account
            </Link>

            <Link to="/login/form" className="auth-gate-secondary">
              Log In
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
