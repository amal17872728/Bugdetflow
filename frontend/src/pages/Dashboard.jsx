import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Line, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  ArcElement,
  Filler, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement,
  ArcElement,
  Filler, Title, Tooltip, Legend
);

// Pie chart segment colors
const PIE_COLORS = [
  '#5b6af0', '#f43f5e', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#06b6d4', '#ef4444',
];

const Dashboard = () => {
  const navigate = useNavigate();
  const userId = useSelector(state => state.user.currentUser?._id);
  const [dashboardData, setDashboardData] = useState({
    summary: { totalBalance: 0, totalIncome: 0, totalExpenses: 0, monthlySavings: 0 },
    recentTransactions: [],
    spendingByCategory: {},
    monthlyTrend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      income:   [0,0,0,0,0,0,0,0,0,0,0,0],
      expenses: [0,0,0,0,0,0,0,0,0,0,0,0],
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/transactions?userId=${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const raw = await response.json();
      setDashboardData(calculateDashboardData(raw));
    } catch (err) {
      if (err.message.includes('fetch') || err.name === 'TypeError') {
        setError("Can't connect to the server. Make sure the backend is running on port 5000.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardData = (transactions) => {
    const empty = {
      summary: { totalBalance: 0, totalIncome: 0, totalExpenses: 0, monthlySavings: 0 },
      recentTransactions: [],
      spendingByCategory: {},
      monthlyTrend: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        income:   [0,0,0,0,0,0,0,0,0,0,0,0],
        expenses: [0,0,0,0,0,0,0,0,0,0,0,0],
      },
    };
    if (!transactions || transactions.length === 0) return empty;

    const transformed = transactions.map(t => ({
      id:          t._id,
      date:        new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      rawDate:     new Date(t.date),
      description: t.description || t.category || 'Transaction',
      category:    t.category || 'General',
      amount:      t.type === 'income' ? Math.abs(t.amount) : -Math.abs(t.amount),
      type:        t.type,
    }));

    const totalIncome   = transformed.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transformed.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalBalance  = totalIncome - totalExpenses;

    const currentMonth = new Date().getMonth();
    const monthTxns    = transformed.filter(t => t.rawDate.getMonth() === currentMonth);
    const monthIncome  = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthExp     = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    const monthlySavings = monthIncome - monthExp;

    const recentTransactions = [...transformed]
      .sort((a, b) => b.rawDate - a.rawDate)
      .slice(0, 5);

    // Spending by category (expenses only)
    const spendingByCategory = {};
    transformed
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Math.abs(t.amount);
      });

    // Monthly trend
    const months     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const incByMonth = Array(12).fill(0);
    const expByMonth = Array(12).fill(0);
    transformed.forEach(t => {
      const m = t.rawDate.getMonth();
      if (t.type === 'income')  incByMonth[m] += t.amount;
      else                       expByMonth[m] += Math.abs(t.amount);
    });

    return {
      summary: { totalBalance, totalIncome, totalExpenses, monthlySavings },
      recentTransactions,
      spendingByCategory,
      monthlyTrend: { labels: months, income: incByMonth, expenses: expByMonth },
    };
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Area Chart (Income vs Expenses) ──
  const lineChartData = {
    labels: dashboardData.monthlyTrend.labels,
    datasets: [
      {
        label: 'Earning',
        data: dashboardData.monthlyTrend.income,
        borderColor: '#1a1d3a',
        backgroundColor: 'rgba(26, 29, 58, 0.75)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: dashboardData.monthlyTrend.expenses,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.65)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#1a1d3a',
          usePointStyle: true,
          pointStyle: 'rect',
          font: { weight: '700', size: 11 },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26,29,58,0.95)',
        titleColor: '#818cf8',
        bodyColor: '#fff',
        cornerRadius: 10,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(91,106,240,0.1)', borderDash: [4, 4] },
        ticks: { color: '#6b7a8d', font: { size: 10 } },
        border: { display: false },
      },
      y: { display: false },
    },
  };

  // ── Doughnut Chart (Spending by Category) ──
  const catLabels = Object.keys(dashboardData.spendingByCategory);
  const catValues = Object.values(dashboardData.spendingByCategory);

  const pieChartData = {
    labels: catLabels,
    datasets: [
      {
        data: catValues,
        backgroundColor: PIE_COLORS.slice(0, catLabels.length),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#1a1d3a',
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11, weight: '600' },
          padding: 14,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26,29,58,0.95)',
        titleColor: '#818cf8',
        bodyColor: '#fff',
        cornerRadius: 10,
        padding: 12,
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.toFixed(2)} (${((ctx.parsed / catValues.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)`,
        },
      },
    },
    cutout: '62%',
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="info-banner">⏳ Loading your dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={fetchDashboardData} className="btn-retry">Try Again</button>
        </div>
      </div>
    );
  }

  const { totalBalance, totalIncome, totalExpenses, monthlySavings } = dashboardData.summary;
  const hasTransactions = dashboardData.recentTransactions.length > 0;
  const hasExpenses     = catLabels.length > 0;

  return (
    <div className="dashboard-page">
      <div className="dash-grid">

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Balance Card */}
          <div className="balance-card">
            <p className="balance-label">Current Balance</p>
            <h1 className="balance-amount">${fmt(totalBalance)}</h1>
            <p className="balance-change positive">
              {totalIncome >= totalExpenses ? '↑' : '↓'}&nbsp;
              Income ${fmt(totalIncome)} · Expenses ${fmt(totalExpenses)}
            </p>

            <div className="balance-stats">
              <div className="bal-stat">
                <div className="bal-stat-label">Income</div>
                <div className="bal-stat-value">${fmt(totalIncome)}</div>
              </div>
              <div className="bal-stat">
                <div className="bal-stat-label">Expenses</div>
                <div className="bal-stat-value">${fmt(totalExpenses)}</div>
              </div>
              <div className="bal-stat">
                <div className="bal-stat-label">Savings</div>
                <div className="bal-stat-value">${fmt(monthlySavings)}</div>
              </div>
            </div>

            <button className="balance-btn" onClick={() => navigate('/transactions')}>
              View Transactions
            </button>
          </div>

          {/* Transaction History */}
          <div className="txn-history-card">
            <h3>Transaction History</h3>
            {!hasTransactions ? (
              <div className="empty-state">
                <span style={{ fontSize: '2rem' }}>💸</span>
                <p>No transactions yet.</p>
                <small>Go to Transactions and add your first one.</small>
              </div>
            ) : (
              <>
                <table className="txn-table">
                  <thead>
                    <tr>
                      <th>Detail</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentTransactions.map(t => (
                      <tr key={t.id}>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.description}
                        </td>
                        <td>
                          <span className={`txn-amount ${t.type === 'income' ? 'positive' : 'negative'}`}>
                            {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.81rem' }}>{t.date}</td>
                        <td><span className="txn-status">Completed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="txn-expand-btn" onClick={() => navigate('/transactions')}>
                  Expand
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="right-col">

          {/* Area Chart: Income vs Expenses */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>Income vs Expenses</h3>
              <select className="chart-period-select" defaultValue="year">
                <option value="year">This Year</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="chart-container">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Pie Chart: Spending by Category */}
          <div className="pie-chart-card">
            <h3>Spending by Category</h3>
            {!hasExpenses ? (
              <div className="pie-empty">
                <span style={{ fontSize: '2rem' }}>🥧</span>
                <p>No expense data yet.</p>
                <small style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Add expense transactions to see the breakdown.
                </small>
              </div>
            ) : (
              <div className="pie-chart-container">
                <Doughnut data={pieChartData} options={pieChartOptions} />
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          <SmartSuggestions
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            monthlySavings={monthlySavings}
            hasTransactions={hasTransactions}
          />

          {/* AI Insights */}
          <AIInsights userId={userId} />

        </div>
      </div>
    </div>
  );
};

const AIInsights = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/ai/recommendations?userId=${userId}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRecommendations(data.recommendations || []);
      setFetched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const typeStyles = {
    danger:  { border: 'var(--pink)',    bg: 'rgba(244,63,94,0.07)'  },
    warning: { border: '#f59e0b',        bg: 'rgba(245,158,11,0.07)' },
    success: { border: 'var(--success)', bg: 'rgba(16,185,129,0.07)' },
    info:    { border: 'var(--primary)', bg: 'rgba(91,106,240,0.07)' },
  };

  return (
    <div className="smart-suggestions">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>✨ AI Insights</h3>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '0.78rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Analyzing...' : fetched ? 'Refresh' : 'Analyze'}
        </button>
      </div>

      {!fetched && !loading && (
        <div className="suggestion-item" style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(91,106,240,0.07)' }}>
          <span className="suggestion-icon">🤖</span>
          <span className="suggestion-text">Click Analyze to get AI-powered insights on your spending habits.</span>
        </div>
      )}

      {error && (
        <div className="suggestion-item" style={{ borderLeft: '4px solid var(--pink)', background: 'rgba(244,63,94,0.07)' }}>
          <span className="suggestion-icon">⚠️</span>
          <span className="suggestion-text">{error}</span>
        </div>
      )}

      {recommendations.map((r, i) => {
        const style = typeStyles[r.type] || typeStyles.info;
        return (
          <div key={i} className="suggestion-item" style={{ borderLeft: `4px solid ${style.border}`, background: style.bg }}>
            <span className="suggestion-icon">{r.icon}</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '2px' }}>{r.title}</div>
              <span className="suggestion-text">{r.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SmartSuggestions = ({ totalIncome, totalExpenses, monthlySavings, hasTransactions }) => {
  const suggestions = [];
  if (!hasTransactions) {
    suggestions.push({ icon: '📝', message: 'Add transactions to get personalized suggestions.', color: 'var(--primary)' });
  } else {
    const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0;
    if (totalExpenses > totalIncome) {
      suggestions.push({ icon: '🚨', message: "You're spending more than you earn! Review your expenses.", color: 'var(--pink)' });
    }
    if (savingsRate < 10 && totalExpenses <= totalIncome) {
      suggestions.push({ icon: '💡', message: 'Savings rate is low. Try the 50/30/20 rule.', color: '#f59e0b' });
    }
    if (savingsRate > 20) {
      suggestions.push({ icon: '🎉', message: "Great job! You're saving well this month.", color: 'var(--success)' });
    }
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="smart-suggestions">
      <h3>Smart Suggestions</h3>
      {suggestions.map((s, i) => (
        <div key={i} className="suggestion-item" style={{ borderLeft: `4px solid ${s.color}` }}>
          <span className="suggestion-icon">{s.icon}</span>
          <span className="suggestion-text">{s.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
