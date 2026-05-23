import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveAuth } from "../api/auth";

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

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-badge">DrishtiMesh Cloud</div>
        <h1>Login</h1>
        <p>Access your sensor dashboard and deploy nodes.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label>Password</label>
          <input type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

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
