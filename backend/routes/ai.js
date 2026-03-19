const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

router.get('/recommendations', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ error: 'GROQ_API_KEY not configured in .env' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const userId = req.query.userId;
    const userFilter = userId ? { userId } : {};

    const [transactions, budgets] = await Promise.all([
      Transaction.find(userFilter).sort({ date: -1 }).limit(100),
      Budget.find(userFilter),
    ]);

    if (transactions.length === 0) {
      return res.json({
        recommendations: [
          {
            icon: '📝',
            title: 'No Data Yet',
            message: 'Add some transactions first to get AI-powered recommendations.',
            type: 'info',
          },
        ],
      });
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const spendingByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
      });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthlyIncome = monthlyTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExpenses = monthlyTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const budgetSummary = budgets.map(b => ({
      category: b.category,
      budgetAmount: b.amount,
      period: b.period,
      spent: spendingByCategory[b.category] || 0,
    }));

    const prompt = `You are a personal finance advisor. Analyze this user's financial data and give 3-4 short, actionable recommendations.

FINANCIAL SUMMARY:
- Total Income (all time): $${totalIncome.toFixed(2)}
- Total Expenses (all time): $${totalExpenses.toFixed(2)}
- Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}
- This Month Income: $${monthlyIncome.toFixed(2)}
- This Month Expenses: $${monthlyExpenses.toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%

SPENDING BY CATEGORY:
${Object.entries(spendingByCategory).map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`).join('\n')}

BUDGETS SET:
${budgetSummary.length > 0 ? budgetSummary.map(b => `- ${b.category}: Budget $${b.budgetAmount} (${b.period}), Spent $${b.spent.toFixed(2)}`).join('\n') : 'No budgets set yet.'}

Respond ONLY with a valid JSON array (no markdown, no explanation) like this:
[
  { "icon": "emoji", "title": "Short Title", "message": "Actionable advice in 1-2 sentences.", "type": "warning|success|info|danger" }
]

Use "danger" for overspending, "warning" for caution, "success" for good habits, "info" for tips.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 600,
    });

    const text = completion.choices[0].message.content.trim();
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const recommendations = JSON.parse(cleaned);

    res.json({ recommendations });
  } catch (err) {
    console.error('AI recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to generate recommendations: ' + err.message });
  }
});

module.exports = router;
