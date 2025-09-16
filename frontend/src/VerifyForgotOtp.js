import { useState } from "react";
import axios from "axios";

export default function VerifyForgotOtp({ email, onVerified }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-forgot-otp", {
        contact: email,
        channel: "email",
        otp,
      });
      if (res.data.verified && res.data.reset_token) {
        setMessage("✅ Xác thực thành công! Bạn có thể đặt lại mật khẩu.");
        if (onVerified) onVerified(res.data.reset_token);
      } else {
        setMessage("❌ Xác thực thất bại!");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Xác thực thất bại!");
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>🔒 Nhập mã OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nhập mã OTP từ email"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Đang xác thực..." : "Xác thực"}</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
