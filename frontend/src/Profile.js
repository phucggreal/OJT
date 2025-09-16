
import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile({ token }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        setError("Không thể lấy thông tin người dùng!");
      }
    };
    if (token) fetchProfile();
  }, [token]);

  if (!token) return <div className="form-container">Vui lòng đăng nhập để xem profile.</div>;
  if (error) return <div className="form-container">{error}</div>;
  if (!profile) return <div className="form-container">Đang tải...</div>;

  return (
    <div className="dashboard-container">
      <h2>👤 Thông tin người dùng</h2>
      <p>Email: {profile.email}</p>
      <p>Username: {profile.username}</p>
      <p>Role: <b>{profile.role}</b></p>
      {/* Thêm các trường khác nếu có */}
    </div>
  );
}
