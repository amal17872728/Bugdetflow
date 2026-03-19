import React, { useState, useEffect } from 'react';
import ExportPDF from '../components/ExportPDF';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../store/toastSlice';

const Transactions = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.currentUser?._id);
  const [transactions, setTransactions]         = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [showForm, setShowForm]                 = useState(false);
  const [newTransaction, setNewTransaction]     = useState({
    amount: '', category: '', description: '', date: '', type: 'expense',
  });
  const [editingId, setEditingId]     = useState(null);
  const [editingDesc, setEditingDesc] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', category: 'all', dateFrom: '', dateTo: '', search: '',
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/transactions?userId=${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const raw = await response.json();
      const transformed = raw.map(t => ({
        id:          t._id,
        date:        new Date(t.date).toISOString().split('T')[0],
        description: t.description,
        category:    t.category,
        amount:      t.type === 'income' ? Math.abs(t.amount) : -Math.abs(t.amount),
        type:        t.type,
      }));
      setTransactions(transformed);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        setError("Can't connect to the server. Make sure the backend is running on port 5000.");
      } else {
        setError(`Failed to load transactions: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ type: 'all', category: 'all', dateFrom: '', dateTo: '', search: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount) {
      dispatch(addToast({ type: 'error', message: 'Amount is required.' })); return;
    }
    if (parseFloat(newTransaction.amount) <= 0) {
      dispatch(addToast({ type: 'error', message: 'Amount must be greater than 0.' })); return;
    }
    if (!newTransaction.category) {
      dispatch(addToast({ type: 'error', message: 'Category is required.' })); return;
    }
    if (!newTransaction.date) {
      dispatch(addToast({ type: 'error', message: 'Please select a date.' })); return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:      parseFloat(newTransaction.amount),
          description: newTransaction.description,
          type:        newTransaction.type,
          date:        new Date(newTransaction.date).toISOString(),
          category:    newTransaction.category,
          userId,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        const msg = errData?.error || errData?.message || 'Failed';
        dispatch(addToast({ type: 'error', message: `Could not save: ${msg}` })); return;
      }
      await fetchTransactions();
      setNewTransaction({ amount: '', category: '', description: '', date: '', type: 'expense' });
      setShowForm(false);
      dispatch(addToast({ type: 'success', message: 'Transaction added!' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: 'Failed to add transaction.' }));
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        dispatch(addToast({ type: 'success', message: 'Transaction deleted.' }));
      } else {
        dispatch(addToast({ type: 'error', message: 'Failed to delete.' }));
      }
    } catch {
      dispatch(addToast({ type: 'error', message: "Can't reach the server." }));
    }
  };

  const handleSaveDescription = async (id) => {
    const trimmed = editingDesc.trim();
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: trimmed }),
      });
      if (response.ok) {
        setTransactions(prev =>
          prev.map(t => t.id === id ? { ...t, description: trimmed } : t)
        );
        dispatch(addToast({ type: 'success', message: 'Description updated.' }));
      } else {
        dispatch(addToast({ type: 'error', message: 'Failed to update description.' }));
      }
    } catch {
      dispatch(addToast({ type: 'error', message: "Can't reach the server." }));
    } finally {
      setEditingId(null);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filters.type !== 'all') {
      if (filters.type === 'income' && t.amount <= 0) return false;
      if (filters.type === 'expense' && t.amount >= 0) return false;
    }
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!t.description?.toLowerCase().includes(s) && !t.category?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalIncome   = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance       = totalIncome - totalExpenses;
  const filteredIncome   = filteredTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const filteredExpenses = filteredTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const filteredBalance  = filteredIncome - filteredExpenses;

  if (loading) return (
    <div className="transactions-page">
      <div className="loading">Loading transactions...</div>
    </div>
  );

  if (error) return (
    <div className="transactions-page">
      <div className="error-banner">
        <span>⚠️ {error}</span>
        <button onClick={fetchTransactions} className="btn-retry">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="page-header">
        <h1>Transactions</h1>
        <div className="header-actions">
          <ExportPDF transactions={filteredTransactions} />
          <button className="btn-add-transaction" onClick={() => setShowForm(true)}>
            + Add New
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="sum-card balance">
          <h3>Current Balance</h3>
          <p className="amount">${balance.toFixed(2)}</p>
          <small>Filtered: ${filteredBalance.toFixed(2)}</small>
        </div>
        <div className="sum-card income">
          <h3>Total Income</h3>
          <p className="amount">${totalIncome.toFixed(2)}</p>
          <small>Filtered: ${filteredIncome.toFixed(2)}</small>
        </div>
        <div className="sum-card expense">
          <h3>Total Expenses</h3>
          <p className="amount">${totalExpenses.toFixed(2)}</p>
          <small>Filtered: ${filteredExpenses.toFixed(2)}</small>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filter Transactions</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Date From</label>
            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>Date To</label>
            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>Search</label>
            <input type="text" name="search" placeholder="Search..." value={filters.search} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>&nbsp;</label>
            <button className="btn-clear-filters" onClick={clearFilters}>Clear</button>
          </div>
        </div>
        <div className="filter-results">
          <p>Showing {filteredTransactions.length} of {transactions.length} transactions</p>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="form-overlay">
          <div className="transaction-form">
            <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit} style={{ background: 'none', boxShadow: 'none', padding: 0, margin: 0, maxWidth: '100%' }}>
              <div className="form-group">
                <label>Amount *</label>
                <input type="number" name="amount" value={newTransaction.amount}
                  onChange={handleInputChange} placeholder="Enter amount" step="0.01" />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input type="text" name="category" value={newTransaction.category}
                  onChange={handleInputChange} placeholder="e.g. Food, Salary, Rent" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" name="description" value={newTransaction.description}
                  onChange={handleInputChange} placeholder="Transaction description" />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" name="date" value={newTransaction.date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={newTransaction.type} onChange={handleInputChange}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Add Transaction</button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>
                    {editingId === t.id ? (
                      <input
                        autoFocus
                        value={editingDesc}
                        onChange={(e) => setEditingDesc(e.target.value)}
                        onBlur={() => handleSaveDescription(t.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveDescription(t.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        style={{
                          border: '1.5px solid var(--primary)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.88rem',
                          width: '100%',
                          outline: 'none',
                          background: 'var(--input-bg)',
                        }}
                      />
                    ) : (
                      <span
                        title="Click to edit"
                        onClick={() => { setEditingId(t.id); setEditingDesc(t.description || ''); }}
                        style={{ cursor: 'pointer', borderBottom: '1px dashed var(--text-muted)' }}
                      >
                        {t.description || <em style={{ color: 'var(--text-muted)' }}>click to add</em>}
                      </span>
                    )}
                  </td>
                  <td>{t.category}</td>
                  <td className={t.type === 'income' ? 'income' : 'expense'}>
                    {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${t.type}`}>{t.type}</span>
                  </td>
                  <td>
                    <button className="btn-delete-transaction" onClick={() => handleDelete(t.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  {transactions.length === 0
                    ? "No transactions yet. Click '+ Add New' to get started."
                    : "No transactions match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
