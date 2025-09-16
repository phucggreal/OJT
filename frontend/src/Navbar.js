import { Link } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  return (
    <nav>
      <h1>MyApp</h1>
      <div>
  <Link to="/">Trang chủ</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">{user.username}</Link>
            <button style={{marginLeft: '1rem'}} onClick={onLogout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
}
