import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "../store/toastSlice";

const Contact = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      dispatch(addToast({ type: "error", message: "Please fill in all fields." }));
      return;
    }
    dispatch(addToast({ type: "success", message: "Message sent! We'll get back to you soon." }));
    setForm({ name: "", email: "", message: "" });
  };

  const cardStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "28px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", border: "2px solid #e1e8ed",
    borderRadius: "8px", fontSize: "0.95rem", boxSizing: "border-box",
    outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2c3e50", marginBottom: "8px", fontSize: "2rem" }}>Contact & Location</h1>
      <p style={{ color: "#6c757d", marginBottom: "28px" }}>Get in touch with us or find our location below.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Left Column */}
        <div>
          {/* Contact Info Card */}
          <div style={cardStyle}>
            <h3 style={{ color: "#2c3e50", marginBottom: "20px", fontSize: "1.1rem" }}>Contact Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "1.3rem" }}>📧</span>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontWeight: "600", color: "#2c3e50", fontSize: "0.9rem" }}>Email</p>
                  <a href="mailto:amalusmaan@gmail.com" style={{ color: "#667eea", textDecoration: "none", fontSize: "0.9rem" }}>
                    amalusmaan@gmail.com
                  </a>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "1.3rem" }}>📞</span>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontWeight: "600", color: "#2c3e50", fontSize: "0.9rem" }}>Phone</p>
                  <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>+92 321 2180900</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "1.3rem" }}>📍</span>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontWeight: "600", color: "#2c3e50", fontSize: "0.9rem" }}>Address</p>
                  <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>Karachi, Sindh, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={cardStyle}>
            <h3 style={{ color: "#2c3e50", marginBottom: "20px", fontSize: "1.1rem" }}>Send a Message</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "500", fontSize: "0.88rem" }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "500", fontSize: "0.88rem" }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "500", fontSize: "0.88rem" }}>Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Your message..."
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white", border: "none", padding: "12px 28px",
                  borderRadius: "8px", fontSize: "0.95rem", fontWeight: "600",
                  cursor: "pointer", width: "100%",
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Map */}
        <div>
          <div style={cardStyle}>
            <h3 style={{ color: "#2c3e50", marginBottom: "16px", fontSize: "1.1rem" }}>Our Location</h3>
            <div style={{ borderRadius: "8px", overflow: "hidden" }}>
              <iframe
                title="Karachi Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462143.6998253358!2d66.59449970000001!3d25.193389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e06651d4bbf%3A0x9cf92f44555a0c23!2sKarachi%2C%20Karachi%20City%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
