const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Get dashboard data
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const transactions = await Transaction.find(query).sort({ date: -1 });
    
    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Spending by category
    const spendingByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Math.abs(t.amount);
      });
    
    // Recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5);
    
    res.json({
      summary: {
        totalBalance: balance,
        totalIncome,
        totalExpenses,
        monthlySavings: totalIncome - totalExpenses
      },
      recentTransactions,
      spendingByCategory,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;