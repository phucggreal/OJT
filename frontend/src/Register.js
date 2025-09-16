
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VerifyOTP from "./VerifyOTP";



export default function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setMessage("❌ Vui lòng nhập đầy đủ tên, email và mật khẩu!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        password,
      });
      setMessage(res.data.message);
      setUserId(res.data.userId);
      setShowOTP(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Đăng ký thất bại!");
    }
  };

  const handleVerified = () => {
    setMessage("✅ Tài khoản đã xác thực! Bạn có thể đăng nhập.");
    setTimeout(() => navigate("/login"), 1500);
  };

  if (showOTP && userId) {
    return <VerifyOTP userId={userId} onVerified={handleVerified} />;
  }

  return (
    <div className="form-container">
      <h2>🔐 Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên người dùng"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Đăng ký</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
