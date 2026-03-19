# BudgetFlow

A full-stack personal finance web app to track income and expenses, manage budgets, and get AI-powered spending insights.

## Features

- **Dashboard** — Real-time balance, income vs expenses chart, spending by category, recent transactions
- **Transactions** — Add, edit, delete, filter, search, and export transactions to PDF
- **Budget Manager** — Set category budgets with email alerts when you're close to overspending
- **AI Insights** — Groq-powered (Llama 3.3 70B) personalized spending recommendations based on your real data
- **Per-user accounts** — Each user sees only their own data
- **Profile page** — Update display name
- **Toast notifications** — Feedback on every action
- **PDF Export** — Download your transaction history

## Tech Stack

**Frontend**
- React 19
- Redux Toolkit
- React Router v7
- Chart.js / react-chartjs-2
- jsPDF + autotable

**Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- Nodemailer (Gmail SMTP)
- Groq API (Llama 3.3 70B)
- bcryptjs

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- Groq API key (free at console.groq.com)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will run at `http://localhost:3000` and connect to the backend at `http://localhost:5000`.

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PORT` | Backend port (default: 5000) |
| `EMAIL_USER` | Gmail address for budget alert emails |
| `EMAIL_PASS` | Gmail app password |
| `GROQ_API_KEY` | Groq API key for AI insights |

## Project Structure

```
fintrack_new/
├── backend/
│   ├── models/          # Mongoose models (User, Transaction, Budget)
│   ├── routes/          # Express routes (transactions, budget, dashboard, ai, users)
│   ├── server.js        # Entry point
│   └── .env             # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── pages/       # Dashboard, Transactions, Budget, Profile, Support, Home
│   │   ├── components/  # Sidebar, Toast, ExportPDF
│   │   └── store/       # Redux slices (user, toast)
│   └── public/
└── README.md
```

## License

MIT
