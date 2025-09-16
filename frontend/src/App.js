
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Navbar from "./Navbar";
import Home from "./Home";
import Profile from "./Profile";
import ForgotPassword from "./ForgotPassword";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  // Xử lý đăng nhập thành công
  const handleLogin = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    setUser(null);
    setToken("");
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
  <Route path="/dashboard" element={<Dashboard token={token} />} />
  <Route path="/profile" element={<Profile token={token} />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
