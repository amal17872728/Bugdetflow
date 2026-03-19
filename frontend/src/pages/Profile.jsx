import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToast } from "../store/toastSlice";
import { updateName } from "../store/userSlice";

const Profile = () => {
  const dispatch    = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser);
  const email       = currentUser?.email || "";

  const [displayName, setDisplayName]           = useState(currentUser?.name || (email ? email.split("@")[0] : ""));
  const [transactionCount, setTransactionCount] = useState(0);
  const [saving, setSaving]                     = useState(false);

  const memberSince = "January 2025";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!email) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/profile?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) setDisplayName(data.name);
        }
      } catch {}
    };

    const fetchCount = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/transactions");
        if (res.ok) {
          const data = await res.json();
          setTransactionCount(Array.isArray(data) ? data.length : 0);
        }
      } catch {}
    };

    fetchProfile();
    fetchCount();
  }, [email]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      dispatch(addToast({ type: "error", message: "Display name cannot be empty." })); return;
    }
    setSaving(true);
    try {
      const res  = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: displayName }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(updateName(displayName));
        dispatch(addToast({ type: "success", message: "Profile updated!" }));
      }
      else dispatch(addToast({ type: "error", message: data.message || "Failed to update." }));
    } catch {
      dispatch(addToast({ type: "error", message: "Server error." }));
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = email ? email[0].toUpperCase() : "U";

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      {/* Avatar + Info */}
      <div className="profile-card">
        <div className="profile-info-row">
          <div className="profile-avatar">{avatarLetter}</div>
          <div>
            <h2>{displayName}</h2>
            <p>{email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-card">
        <h3>Account Stats</h3>
        <div className="profile-stats-grid">
          <div className="profile-stat-item">
            <p>Member Since</p>
            <p>{memberSince}</p>
          </div>
          <div className="profile-stat-item">
            <p>Total Transactions</p>
            <p>{transactionCount}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="profile-card">
        <h3>Edit Profile</h3>
        <form onSubmit={handleSave} style={{ background: 'none', boxShadow: 'none', padding: 0, margin: 0, maxWidth: '100%' }}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              style={{ background: '#f5fdf8', color: '#aaa', cursor: 'not-allowed' }}
            />
          </div>
          <button type="submit" disabled={saving} className="profile-save-btn">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
