import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminHome = ({ admin, setPage, handleLogout }) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!admin) {
      setPage("home");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/admin/users");
        const data = await res.json();

        if (res.ok) {
          setTotalUsers(data.totalUsers);

          const userListRes = await fetch("http://localhost:5000/api/users");
          const userListData = await userListRes.json();
          if (userListRes.ok) setUsers(userListData.users || []);
        } else {
          console.error("Failed to fetch users:", data.message);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [admin, setPage]);

  const monthlyRegistrationData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "New User Registrations",
        data: [12, 19, 15, 28, 22, 35, 40, 31, 27, 33, 45, 38],
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Monthly User Registrations (2025)",
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5 },
      },
    },
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="btn logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="admin-intro">
        <p>
          Welcome to your admin dashboard! Here you can monitor users, track
          activity, and manage the BudgetFlow application.
        </p>
      </section>

      <section className="admin-stats">
        <h2>Total Users: {totalUsers}</h2>
      </section>

      {/* Monthly Registration Bar Chart */}
      <section style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", margin: "20px 0" }}>
        <div style={{ height: "320px" }}>
          <Bar data={monthlyRegistrationData} options={barOptions} />
        </div>
      </section>

      <section className="admin-user-list">
        <h3>Users List:</h3>
        {users.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users to display</p>
        )}
      </section>

      <section className="admin-notes">
        <h3>Notes / Quick Actions</h3>
        <ul>
          <li>Monitor user activity regularly.</li>
          <li>Review app feedback and suggestions.</li>
          <li>Manage and update content for users.</li>
        </ul>
      </section>
    </div>
  );
};

export default AdminHome;
