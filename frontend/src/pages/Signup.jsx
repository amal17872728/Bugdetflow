import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "../store/toastSlice";

const Signup = ({ setUser, setPage }) => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      dispatch(addToast({ type: 'error', message: 'Enter email and password' }));
      return;
    }
    try {
      const res  = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: email.split("@")[0] }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(addToast({ type: 'error', message: data.message || "Signup failed" }));
        return;
      }
      dispatch(addToast({ type: 'success', message: data.message || "Account created!" }));
      setPage("login");
    } catch (err) {
      dispatch(addToast({ type: 'error', message: "Server error. Please try again later." }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo">BudgetFlow</span>
        <h2>Create account</h2>
        <p className="auth-subtitle">Start tracking your finances today — it's free.</p>

        <form onSubmit={handleSignup} style={{ background: 'none', boxShadow: 'none', padding: 0, margin: 0, maxWidth: '100%' }}>
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

          <button type="submit" className="auth-btn">Create Account</button>
          <button type="button" className="auth-back" onClick={() => setPage("home")}>
            ← Back to Home
          </button>
        </form>

        <p className="auth-link-text">
          Already have an account?{" "}
          <span onClick={() => setPage("login")}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
