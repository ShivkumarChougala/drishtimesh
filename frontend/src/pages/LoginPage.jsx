import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin, saveAuth } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(form);
      saveAuth(data);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    setLoading(true);

    try {
      const data = await googleLogin(credentialResponse.credential);
      saveAuth(data);
      navigate("/dashboard");
    } catch {
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-badge">DrishtiMesh Cloud</div>
        <h1>Welcome back</h1>
        <p>Monitor threat activity, analyze IP reputation, and manage your sensor network.</p>

        <div className="google-auth-wrap google-auth-clean">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="360"
          />
        </div>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <div className="auth-error">{error}</div>}

          <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>

        <p className="auth-switch">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </main>
  );
}
