import React, { useState, createContext } from "react";
import './styles.css';
import './App.css';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardApp from "./DashboardApp";
import Toast from "./components/Toast";
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setPage, logout } from './store/userSlice';

export const ThemeContext = createContext();

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser);
  const page = useSelector(state => state.user.page);

  const handleSetUser = (user) => dispatch(setUser(user));
  const handleSetPage = (p) => dispatch(setPage(p));
  const handleLogout = () => dispatch(logout());

  if (currentUser) {
    return (
      <>
        <DashboardApp handleLogout={handleLogout} />
        <Toast />
      </>
    );
  }

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div>
        {page === "home" && (
          <Home setPage={handleSetPage} user={currentUser} handleLogout={handleLogout} />
        )}
        {page === "login" && (
          <Login setUser={handleSetUser} setPage={handleSetPage} />
        )}
        {page === "signup" && (
          <Signup setUser={handleSetUser} setPage={handleSetPage} />
        )}
        <Toast />
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
