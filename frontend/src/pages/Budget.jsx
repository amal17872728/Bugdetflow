import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../store/toastSlice';

const Budget = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.currentUser?._id);
  const [budgets, setBudgets]           = useState([]);
  const [categories, setCategories]     = useState([]);
  const [newBudget, setNewBudget]       = useState({ category: '', amount: '', period: 'monthly' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [email, setEmail]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [emailInput, setEmailInput]     = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/budgets?userId=${userId}`);
      if (res.ok) setBudgets(await res.json());
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions?userId=${userId}`);
      if (res.ok) {
        const txns = await res.json();
        const unique = [...new Set(txns.map(t => t.category))].filter(c => c && c !== 'all');
        setCategories(unique);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    const saved = localStorage.getItem('notificationsEnabled');
    const savedEmail = localStorage.getItem('userEmail');
    if (saved) setNotificationsEnabled(JSON.parse(saved));
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.amount) {
      dispatch(addToast({ type: 'error', message: 'Please fill in all fields' })); return;
    }
    try {
      const res  = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          category: newBudget.category,
          amount:   parseFloat(newBudget.amount),
          period:   newBudget.period,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBudgets(prev => [...prev, data]);
        setNewBudget({ category: '', amount: '', period: 'monthly' });
        dispatch(addToast({ type: 'success', message: `Budget for "${data.category}" added!` }));
      } else {
        dispatch(addToast({ type: 'error', message: data.message || 'Failed to add budget.' }));
      }
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.name === 'TypeError' ? "Can't reach the server." : `Error: ${err.message}` }));
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/budgets/${budgetId}`, { method: 'DELETE' });
      if (res.ok) {
        setBudgets(prev => prev.filter(b => b._id !== budgetId));
        dispatch(addToast({ type: 'success', message: 'Budget deleted!' }));
      }
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to delete budget.' }));
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('notificationsEnabled', JSON.stringify(next));
    if (next && !email) setShowEmailPrompt(true);
  };

  const handleEmailPromptSubmit = () => {
    if (emailInput) {
      setEmail(emailInput);
      localStorage.setItem('userEmail', emailInput);
      setShowEmailPrompt(false);
      setEmailInput('');
    } else {
      setNotificationsEnabled(false);
      setShowEmailPrompt(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) { dispatch(addToast({ type: 'warning', message: 'Set your email first' })); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/budgets/send-budget-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) dispatch(addToast({ type: 'success', message: 'Budget email sent!' }));
      else throw new Error('Failed');
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to send email.' }));
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgetUsage = (budget) => {
    const spent      = Math.random() * budget.amount;
    const percentage = (spent / budget.amount) * 100;
    return { spent: spent.toFixed(2), percentage: percentage.toFixed(1), remaining: (budget.amount - spent).toFixed(2) };
  };

  return (
    <div className="budget-page">
      <div className="page-header">
        <h1>Budget Manager</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Set budgets and manage email notifications
        </p>
      </div>

      {/* Email Prompt Modal */}
      {showEmailPrompt && (
        <div className="form-overlay">
          <div className="transaction-form" style={{ maxWidth: '400px' }}>
            <h2>Set Email for Alerts</h2>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)} />
            </div>
            <div className="form-buttons">
              <button className="btn-submit" onClick={handleEmailPromptSubmit}>Save</button>
              <button className="btn-cancel" onClick={() => { setShowEmailPrompt(false); setNotificationsEnabled(false); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="form-overlay">
          <div className="transaction-form" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <h2>Confirm Delete</h2>
            <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
              Are you sure you want to delete this budget?
            </p>
            <div className="form-buttons" style={{ justifyContent: 'center' }}>
              <button className="btn-submit" style={{ background: 'var(--pink)', color: 'white' }}
                onClick={() => handleDeleteBudget(confirmDeleteId)}>Delete</button>
              <button className="btn-cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="budget-layout">
        {/* Left Column */}
        <div className="budget-section">
          {/* Add Budget Form */}
          <div className="budget-form-card">
            <h3>Add New Budget</h3>
            <form onSubmit={handleAddBudget} style={{ background: 'none', boxShadow: 'none', padding: 0, margin: 0, maxWidth: '100%' }}>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={newBudget.category} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="other">Other</option>
                </select>
              </div>
              {newBudget.category === 'other' && (
                <div className="form-group">
                  <label>Custom Category</label>
                  <input type="text" placeholder="Enter category"
                    onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))} />
                </div>
              )}
              <div className="form-group">
                <label>Amount</label>
                <input type="number" name="amount" value={newBudget.amount}
                  onChange={handleInputChange} placeholder="Budget amount" step="0.01" min="0" />
              </div>
              <div className="form-group">
                <label>Period</label>
                <select name="period" value={newBudget.period} onChange={handleInputChange}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <button type="submit" className="btn-add-budget">Add Budget</button>
            </form>
          </div>

          {/* Budget List */}
          <div className="budget-list-card">
            <h3>Your Budgets</h3>
            {budgets.length === 0 ? (
              <p className="no-budgets">No budgets set yet. Add your first budget above.</p>
            ) : (
              <div className="budgets-list">
                {budgets.map(budget => {
                  const usage = calculateBudgetUsage(budget);
                  return (
                    <div key={budget._id} className="budget-item">
                      <div className="budget-header">
                        <div className="budget-category">{budget.category}</div>
                        <button className="btn-delete" onClick={() => setConfirmDeleteId(budget._id)}>
                          Delete
                        </button>
                      </div>
                      <div className="budget-amount">
                        ${budget.amount} / {budget.period}
                      </div>
                      <div className="usage-bar">
                        <div className="usage-fill" style={{ width: `${Math.min(usage.percentage, 100)}%` }} />
                      </div>
                      <div className="usage-text">
                        ${usage.spent} spent · ${usage.remaining} remaining
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="notifications-section">
          <div className="notifications-card">
            <h3>Email Notifications</h3>
            <div className="notification-toggle">
              <label className="toggle-label">
                <span>Enable Email Alerts</span>
                <div className="toggle-switch">
                  <input type="checkbox" checked={notificationsEnabled} onChange={handleToggleNotifications} />
                  <span className="slider" />
                </div>
              </label>
              <p className="toggle-description">
                Get alerts when you're close to exceeding your budgets.
              </p>
            </div>

            {notificationsEnabled && (
              <div className="email-section">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={email} placeholder="your@email.com"
                    onChange={(e) => { setEmail(e.target.value); localStorage.setItem('userEmail', e.target.value); }} />
                </div>
                <div className="email-actions">
                  <button onClick={handleSendEmail} disabled={loading || !email} className="btn-send-email">
                    {loading ? 'Sending...' : 'Send Budget Summary Email'}
                  </button>
                  <p className="email-note">Sends your current budget allocation to your email.</p>
                </div>
              </div>
            )}

            {notificationsEnabled && (
              <div className="notification-settings">
                <h4>Alert Preferences</h4>
                <div className="alert-options">
                  {[
                    'Notify when 80% of budget is used',
                    'Notify when budget is exceeded',
                    'Weekly budget summary',
                  ].map((label, i) => (
                    <label key={i} className="alert-option">
                      <input type="checkbox" defaultChecked />
                      <span>{label}</span>
                    </label>
                  ))}
                  <label className="alert-option">
                    <input type="checkbox" />
                    <span>Large transaction alerts</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="tips-card">
            <h3>Budgeting Tips</h3>
            <ul className="tips-list">
              <li>💡 Set realistic budgets based on past spending</li>
              <li>📊 Review budgets monthly and adjust as needed</li>
              <li>🔔 Enable notifications to stay on track</li>
              <li>🎯 Focus on reducing your highest-spend categories</li>
              <li>💰 Allocate 20% of income to savings when possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;
