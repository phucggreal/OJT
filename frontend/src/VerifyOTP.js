import { useState } from "react";
import axios from "axios";

export default function VerifyOTP({ userId, onVerified }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        userId,
        otp,
      });
      setMessage("✅ Xác thực thành công!");
      if (onVerified) onVerified();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Xác thực thất bại!");
    }
  };

  return (
    <div className="form-container">
      <h2>🔑 Xác thực Email</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nhập mã OTP từ email"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button type="submit">Xác thực</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
