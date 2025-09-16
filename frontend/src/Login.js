

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginValue || !password) {
      setMessage("❌ Vui lòng nhập email/username và mật khẩu!");
      return;
    }
    try {
      // Chỉ truyền đúng loại: nếu có @ thì là email, còn lại là username
      const isEmail = loginValue.includes("@");
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: isEmail ? loginValue : undefined,
        username: !isEmail ? loginValue : undefined,
        password,
      });
      setMessage("✅ Đăng nhập thành công!");
      // Giải mã token để lấy user info
      const jwtPayload = JSON.parse(atob(res.data.token.split('.')[1]));
      const userObj = {
        username: jwtPayload.username,
        email: jwtPayload.email,
        role: jwtPayload.role
      };
      if (onLogin) onLogin(userObj, res.data.token);
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Đăng nhập thất bại!");
    }
  };

  return (
    <div className="form-container">
      <h2>🔐 Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email hoặc Username"
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{textAlign: 'right', marginBottom: '8px'}}>
          <a href="/forgot-password" style={{color: '#4b6cb7', textDecoration: 'underline', fontSize: '0.95em'}}>Quên mật khẩu?</a>
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      <div style={{textAlign: 'center', marginTop: '16px'}}>
        <a href="/register" style={{color: '#182848', textDecoration: 'underline', fontWeight: 'bold'}}>Đăng ký tài khoản mới</a>
      </div>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
