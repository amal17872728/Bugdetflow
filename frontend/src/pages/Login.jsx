import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "../store/toastSlice";

const Login = ({ setUser, setPage }) => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const HARDCODED_EMAIL    = "test@gmail.com";
  const HARDCODED_PASSWORD = "123456";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      dispatch(addToast({ type: 'error', message: 'Enter email and password' }));
      return;
    }
    if (email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
      setUser({ email, role: "user" });
      setPage("home");
      return;
    }
    try {
      const res  = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(addToast({ type: 'error', message: data.message || "Login failed" }));
        return;
      }
      setUser({ _id: data._id, email: data.email, name: data.name, role: data.role });
      setPage("home");
    } catch (err) {
      dispatch(addToast({ type: 'error', message: "Server error. Please try again later." }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo">BudgetFlow</span>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue.</p>

        <form onSubmit={handleLogin} style={{ background: 'none', boxShadow: 'none', padding: 0, margin: 0, maxWidth: '100%' }}>
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-btn">Sign In</button>
          <button type="button" className="auth-back" onClick={() => setPage("home")}>
            ← Back to Home
          </button>
        </form>

        <p className="auth-link-text">
          Don't have an account?{" "}
          <span onClick={() => setPage("signup")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
