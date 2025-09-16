
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard({ token }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setMessage(res.data.message || "Đăng nhập thành công!");
      } catch (err) {
        setMessage("❌ Bạn chưa đăng nhập hoặc API lỗi!");
      }
    };
    fetchData();
  }, [token]);

  if (!token) return <div className="dashboard-container">Vui lòng đăng nhập để xem dashboard.</div>;

  return (
    <div className="dashboard-container">
      <h2>📊 Dashboard</h2>
      <p>{message}</p>
    </div>
  );
}