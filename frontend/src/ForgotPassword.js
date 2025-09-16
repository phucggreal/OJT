
import { useState } from "react";
import axios from "axios";
import VerifyForgotOtp from "./VerifyForgotOtp";
import ResetPassword from "./ResetPassword";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { contact: email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage("Có lỗi xảy ra, vui lòng thử lại!");
    }
    setLoading(false);
  };

  const handleOtpVerified = (token) => {
    setResetToken(token);
    setStep(3);
  };

  if (step === 2) {
    return <VerifyForgotOtp email={email} onVerified={handleOtpVerified} />;
  }
  if (step === 3) {
    return <ResetPassword resetToken={resetToken} />;
  }

  return (
    <div className="form-container">
      <h2>🔑 Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email đăng ký"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Đang gửi..." : "Gửi mã OTP"}</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
