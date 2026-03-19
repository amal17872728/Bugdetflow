import React, { useState } from "react";

const FEATURES = [
  {
    title: "Smart Dashboard",
    desc: "Get a real-time visual overview of your balance, income, and spending with beautiful interactive charts — all in one glance.",
  },
  {
    title: "Track Transactions",
    desc: "Log every income and expense instantly. Filter, search, and export your full financial history whenever you need it.",
  },
  {
    title: "Budget Goals",
    desc: "Set spending limits by category and get automatic email alerts before you overspend — stay in control effortlessly.",
  },
  {
    title: "AI Insights",
    desc: "Let our built-in AI analyze your spending patterns and deliver personalized recommendations to help you save smarter.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Freelance Designer",
    quote:
      "BudgetFlow completely changed how I manage my income. The dashboard is stunning and the AI tips are actually useful — not just generic advice.",
    avatar: "S",
  },
  {
    name: "Omar R.",
    role: "University Student",
    quote:
      "I used to lose track of where my money went every month. Now I check BudgetFlow daily. It's simple, fast, and free. Couldn't ask for more.",
    avatar: "O",
  },
  {
    name: "Priya M.",
    role: "Marketing Manager",
    quote:
      "The budget alert emails saved me from overspending twice this month. The interface feels premium — hard to believe it's a free tool.",
    avatar: "P",
  },
];

const Home = ({ setPage, user, handleLogout }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const prevFeature = () => setActiveFeature(i => (i === 0 ? FEATURES.length - 1 : i - 1));
  const nextFeature = () => setActiveFeature(i => (i === FEATURES.length - 1 ? 0 : i + 1));

  const visibleFeatures = [
    FEATURES[activeFeature % FEATURES.length],
    FEATURES[(activeFeature + 1) % FEATURES.length],
    FEATURES[(activeFeature + 2) % FEATURES.length],
  ];

  return (
    <div className="home-container">

      {/* ── HEADER ── */}
      <header className="home-header">
        <span className="logo">BudgetFlow</span>
        <div className="nav-buttons">
          {user ? (
            <button className="btn" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <button className="btn" onClick={() => setPage("login")}>Login</button>
              <button className="btn" onClick={() => setPage("signup")}>Sign Up</button>
            </>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="home-intro">
        <div className="hero-badge">Free. No credit card needed.</div>
        <h1>Take Control of<br />Your Finances</h1>
        <p>
          BudgetFlow helps you track income and expenses, manage budgets,
          and stay on top of your financial goals — all in one place.
        </p>
        <div className="home-cta">
          <button className="btn-primary" onClick={() => setPage("signup")}>
            Get Started Free →
          </button>
          <button className="btn-secondary" onClick={() => setPage("login")}>
            Sign In
          </button>
        </div>

        {/* floating stat pills */}
        <div className="hero-stats">
          <div className="hero-stat-pill">Track Income</div>
          <div className="hero-stat-pill">Cut Expenses</div>
          <div className="hero-stat-pill">AI Insights</div>
        </div>
      </section>

      {/* ── SERVICES (carousel-style) ── */}
      <section className="services-section">
        <div className="services-header">
          <h2 className="services-title">What We Offer</h2>
          <div className="services-arrows">
            <button className="arrow-btn" onClick={prevFeature}>&#8249;</button>
            <button className="arrow-btn" onClick={nextFeature}>&#8250;</button>
          </div>
        </div>

        <div className="services-panel">
          {visibleFeatures.map((f, i) => (
            <div className="service-item" key={i}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <button className="service-readmore" onClick={() => setPage("signup")}>
                Get started &#187;&#187;
              </button>
            </div>
          ))}
        </div>

        <div className="services-dots">
          {FEATURES.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === activeFeature ? "dot-active" : ""}`}
              onClick={() => setActiveFeature(i)}
            />
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS + LINKS ── */}
      <section className="testimonial-section">
        <div className="testimonial-left">
          <h2 className="testimonial-heading">TESTIMONIAL</h2>
          <div className="testimonial-quote">
            <p>"{TESTIMONIALS[activeTestimonial].quote}"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                {TESTIMONIALS[activeTestimonial].avatar}
              </div>
              <div>
                <strong>{TESTIMONIALS[activeTestimonial].name}</strong>
                <span>{TESTIMONIALS[activeTestimonial].role}</span>
              </div>
            </div>
          </div>
          <div className="testimonial-nav">
            {TESTIMONIALS.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === activeTestimonial ? "dot-active dot-light" : "dot-light"}`}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>

        <div className="testimonial-divider" />

        <div className="testimonial-right">
          <h2 className="testimonial-heading">LINKS</h2>
          <ul className="footer-links">
            <li><span>&#9658;</span> <button onClick={() => setPage("signup")}>Get Started</button></li>
            <li><span>&#9658;</span> <button onClick={() => setPage("login")}>Sign In</button></li>
          </ul>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <p>© 2026 BudgetFlow. All Rights Reserved. &nbsp;|&nbsp; Contact: <strong>+92 321 2180900</strong></p>
      </footer>

    </div>
  );
};

export default Home;
