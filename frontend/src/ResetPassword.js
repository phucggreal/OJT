import { useState } from "react";
import axios from "axios";



export default function ResetPassword({ resetToken }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("❌ Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!password) {
      setMessage("❌ Vui lòng nhập mật khẩu!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        reset_token: resetToken,
        password,
      });
      if (res.data.success) {
        setMessage("✅ Đổi mật khẩu thành công! Bạn có thể đăng nhập lại.");
      } else {
        setMessage("❌ Đổi mật khẩu thất bại!");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Đổi mật khẩu thất bại!");
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>🔑 Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Đang đổi..." : "Đổi mật khẩu"}</button>
      </form>
      {/* Không kiểm tra độ mạnh mật khẩu */}
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
