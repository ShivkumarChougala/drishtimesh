import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup, saveAuth } from "../api/auth";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signup(form);
      saveAuth(data);
      navigate("/dashboard");
    } catch {
      setError("Could not create account. Email may already exist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-badge">Start your mesh</div>
        <h1>Create account</h1>
        <p>Create your workspace and deploy your first sensor.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Name</label>
          <input required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label>Email</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label>Password</label>
          <input type="password" required minLength="6" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          {error && <div className="auth-error">{error}</div>}

          <button disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
        </form>

        <p className="auth-switch">
          Already have account? <Link to="/login/form">Login</Link>
        </p>
      </section>
    </main>
  );
}
