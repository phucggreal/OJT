import { useState, useEffect } from "react";
import axios from "axios";

export default function ResendOtpButton({ email, onResent }) {
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { contact: email });
      setMessage(res.data.message);
      setCountdown(60);
      if (onResent) onResent();
    } catch (err) {
      setMessage("Có lỗi khi gửi lại OTP!");
    }
    setLoading(false);
  };

  return (
    <div style={{marginTop:16}}>
      <button onClick={handleResend} disabled={countdown > 0 || loading}>
        {countdown > 0 ? `Gửi lại OTP (${countdown}s)` : loading ? "Đang gửi..." : "Gửi lại OTP"}
      </button>
      {message && <p className="mt-2 text-center">{message}</p>}
    </div>
  );
}
