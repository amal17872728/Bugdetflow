const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require("./routes/userRoutes");
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const migrateOrphanedData = async () => {
  try {
    const orphanedCount = await Transaction.countDocuments({ userId: { $exists: false } });
    if (orphanedCount === 0) return;
    const firstUser = await User.findOne().sort({ createdAt: 1 });
    if (!firstUser) return;
    const userId = firstUser._id.toString();
    await Transaction.updateMany({ userId: { $exists: false } }, { $set: { userId } });
    await Budget.updateMany({ userId: { $exists: false } }, { $set: { userId } });
    console.log(`Migrated ${orphanedCount} orphaned records to user: ${firstUser.email}`);
  } catch (err) {
    console.error('Migration error:', err.message);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas connected successfully');
    await migrateOrphanedData();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/budgets', require('./routes/budget'));
app.use('/api/users', userRoutes);
app.use('/api/ai', require('./routes/ai'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
