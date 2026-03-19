const express = require('express');
const Budget = require('../models/Budget');
const router = express.Router();
const nodemailer = require('nodemailer');

// Get all budgets
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const budgets = await Budget.find(query).sort({ category: 1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new budget
router.post('/', async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    
    const { userId } = req.body;

    // Check if budget already exists for this category for this user
    const existingBudget = await Budget.findOne({ category, userId });
    if (existingBudget) {
      return res.status(400).json({ message: 'Budget already exists for this category' });
    }

    const budget = new Budget({
      userId,
      category,
      amount: parseFloat(amount),
      period
    });

    const savedBudget = await budget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      { category, amount: parseFloat(amount), period },
      { new: true }
    );
    res.json(updatedBudget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send budget email
router.post('/send-budget-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        message: 'Email service not configured. Please set up EMAIL_USER and EMAIL_PASS in your .env file.' 
      });
    }

    console.log('📧 Attempting to send email to:', email);
    
    // Get all budgets
    const budgets = await Budget.find();
    
    if (budgets.length === 0) {
      return res.status(400).json({ 
        message: 'No budgets found. Please create some budgets first.' 
      });
    }

    // Create email content
    const emailContent = createBudgetEmailContent(budgets);
    
    // Send email
    await sendEmail(email, 'Your Budget Allocation Summary - FinTrack', emailContent);
    
    console.log('✅ Email sent successfully to:', email);
    res.json({ message: 'Budget email sent successfully! Check your inbox.' });
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ 
      message: 'Failed to send email: ' + error.message 
    });
  }
});

// Test email configuration
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        message: 'Email credentials not found in environment variables' 
      });
    }

    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4CAF50;">✅ FinTrack Test Email</h2>
        <p>If you're reading this, your email configuration is working correctly! 🎉</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
        <p><strong>To:</strong> ${email}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is a test email from your FinTrack application.
        </p>
      </div>
    `;
    
    await sendEmail(email, 'FinTrack - Test Email Configuration', testHtml);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully! Please check your inbox and spam folder.' 
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email: ' + error.message 
    });
  }
});

// Check for over-budget alerts
router.post('/check-budget-alerts', async (req, res) => {
  try {
    const { category, amount, userEmail } = req.body;
    
    if (!category || !amount) {
      return res.status(400).json({ message: 'Category and amount are required' });
    }

    const budget = await Budget.findOne({ category });
    if (budget) {
      // Get current month's spending for this category
      const currentSpending = await getCurrentSpending(category);
      const totalSpent = currentSpending + parseFloat(amount);
      
      // If user has email and notifications enabled, send alerts
      if (userEmail) {
        if (totalSpent > budget.amount) {
          await sendOverBudgetAlert(userEmail, category, budget.amount, totalSpent);
        } else if (totalSpent > budget.amount * 0.8) {
          await sendBudgetWarningAlert(userEmail, category, budget.amount, totalSpent);
        }
      }
    }
    
    res.json({ 
      message: 'Budget check completed',
      budgetExceeded: budget && totalSpent > budget.amount 
    });
    
  } catch (error) {
    console.error('Error checking budget alerts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get budget summary
router.get('/summary', async (req, res) => {
  try {
    const budgets = await Budget.find();
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    
    res.json({
      totalBudgets: budgets.length,
      totalBudgetAmount: totalBudget,
      budgetsByPeriod: {
        weekly: budgets.filter(b => b.period === 'weekly').length,
        monthly: budgets.filter(b => b.period === 'monthly').length,
        yearly: budgets.filter(b => b.period === 'yearly').length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to send email
async function sendEmail(to, subject, html) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email server connection verified');

    const mailOptions = {
      from: `"FinTrack Budget Manager" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
      // Optional: Add text version for email clients that don't support HTML
      text: html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully. Message ID:', info.messageId);
    return info;
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

function createBudgetEmailContent(budgets) {
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
        }
        .header { 
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0;
        }
        .content { 
          background: #f9f9f9; 
          padding: 30px; 
          border-radius: 0 0 10px 10px;
        }
        .budget-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .budget-table th, .budget-table td { 
          padding: 15px; 
          border-bottom: 1px solid #e0e0e0; 
          text-align: left; 
        }
        .budget-table th { 
          background-color: #f8f9fa; 
          font-weight: bold;
          color: #2c3e50;
        }
        .budget-table tr:last-child td { 
          border-bottom: none; 
        }
        .footer { 
          background: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
          margin-top: 20px;
          border-radius: 8px;
        }
        .total-row { 
          font-weight: bold; 
          background-color: #e8f5e8; 
        }
        .tips { 
          background: #e3f2fd; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
        }
        .tip-item { 
          margin: 10px 0; 
          display: flex; 
          align-items: center;
        }
        .tip-icon { 
          margin-right: 10px; 
          font-size: 18px; 
        }
        .period-badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 FinTrack Budget Summary</h1>
        <p>Your Personal Budget Allocation Overview</p>
      </div>
      
      <div class="content">
        <h2>Hello! 👋</h2>
        <p>Here's an overview of your current budget allocation. Stay on track with your financial goals!</p>
        
        <table class="budget-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget Amount</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
            ${budgets.map(budget => `
              <tr>
                <td><strong>${budget.category}</strong></td>
                <td>$${budget.amount.toFixed(2)}</td>
                <td><span class="period-badge">${budget.period}</span></td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td><strong>Total Budget Allocation</strong></td>
              <td><strong>$${totalBudget.toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        
        <div class="tips">
          <h3>💡 Smart Budgeting Tips</h3>
          <div class="tip-item">
            <span class="tip-icon">📊</span>
            <span>Review your budgets weekly and adjust as needed</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🎯</span>
            <span>Set aside 20% of your income for savings</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🔔</span>
            <span>Enable notifications to stay within your budgets</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">💪</span>
            <span>You're doing great managing your finances!</span>
          </div>
        </div>
        
        <p><strong>Next Steps:</strong> Log in to your FinTrack dashboard to track your spending against these budgets.</p>
      </div>
      
      <div class="footer">
        <p>This email was sent from your FinTrack application.</p>
        <p>If you didn't request this email, please ignore it.</p>
        <p>💚 Thank you for using FinTrack to manage your finances!</p>
      </div>
    </body>
    </html>
  `;
}

async function sendOverBudgetAlert(userEmail, category, budgetAmount, currentSpent) {
  const subject = `🚨 Budget Exceeded: ${category}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #fff; border: 2px solid #e74c3c; border-radius: 10px;">
      <h2 style="color: #e74c3c;">🚨 Budget Alert</h2>
      <p>You have exceeded your budget for <strong style="color: #e74c3c;">${category}</strong>!</p>
      
      <div style="background: #fdf2f2; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <ul style="list-style: none; padding: 0;">
          <li>📊 <strong>Category:</strong> ${category}</li>
          <li>💰 <strong>Budget Limit:</strong> $${budgetAmount.toFixed(2)}</li>
          <li>💸 <strong>Current Spending:</strong> $${currentSpent.toFixed(2)}</li>
          <li>⚠️ <strong>Over Budget By:</strong> $${(currentSpent - budgetAmount).toFixed(2)}</li>
        </ul>
      </div>
      
      <p><strong>Recommendations:</strong></p>
      <ul>
        <li>Review your recent transactions in this category</li>
        <li>Consider adjusting your budget if this is a new spending pattern</li>
        <li>Look for ways to reduce spending in this category next month</li>
      </ul>
      
      <p>You can manage your budgets in the FinTrack app.</p>
    </div>
  `;
  
  try {
    await sendEmail(userEmail, subject, html);
    console.log(`✅ Over-budget alert sent for ${category}`);
  } catch (error) {
    console.error(`❌ Failed to send over-budget alert:`, error);
  }
}

async function sendBudgetWarningAlert(userEmail, category, budgetAmount, currentSpent) {
  const subject = `⚠️ Budget Warning: ${category}`;
  const percentageUsed = (currentSpent / budgetAmount) * 100;
  const remaining = budgetAmount - currentSpent;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #fff; border: 2px solid #f39c12; border-radius: 10px;">
      <h2 style="color: #f39c12;">⚠️ Budget Warning</h2>
      <p>You're approaching your budget limit for <strong style="color: #f39c12;">${category}</strong>.</p>
      
      <div style="background: #fef9e7; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <ul style="list-style: none; padding: 0;">
          <li>📊 <strong>Category:</strong> ${category}</li>
          <li>💰 <strong>Budget Limit:</strong> $${budgetAmount.toFixed(2)}</li>
          <li>💸 <strong>Current Spending:</strong> $${currentSpent.toFixed(2)}</li>
          <li>📈 <strong>Budget Used:</strong> ${percentageUsed.toFixed(1)}%</li>
          <li>🎯 <strong>Remaining Budget:</strong> $${remaining.toFixed(2)}</li>
        </ul>
      </div>
      
      <div style="background: #2c3e50; color: white; padding: 10px; border-radius: 5px; text-align: center; margin: 15px 0;">
        <strong>${percentageUsed.toFixed(1)}% OF BUDGET USED</strong>
      </div>
      
      <p><strong>Tips to stay on track:</strong></p>
      <ul>
        <li>Monitor your spending in this category closely</li>
        <li>Consider if any upcoming expenses might push you over budget</li>
        <li>You have $${remaining.toFixed(2)} remaining for this period</li>
      </ul>
    </div>
  `;
  
  try {
    await sendEmail(userEmail, subject, html);
    console.log(`✅ Budget warning sent for ${category} (${percentageUsed.toFixed(1)}% used)`);
  } catch (error) {
    console.error(`❌ Failed to send budget warning:`, error);
  }
}

// Mock function - replace with actual spending calculation from transactions
async function getCurrentSpending(category) {
  try {
    // This would typically query your transactions database
    // For now, return a mock value
    return Math.random() * 500;
  } catch (error) {
    console.error('Error calculating current spending:', error);
    return 0;
  }
}

module.exports = router;