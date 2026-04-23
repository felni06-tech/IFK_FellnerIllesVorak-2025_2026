import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AppointmentBooking from './pages/AppointmentBooking';
import UserBookings from './pages/UserBookings';
import './App.css';

function App() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  
  const savedUser = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
  const savedAdmin = isLoggedIn ? JSON.parse(localStorage.getItem('admin')) : null;

  const user = savedUser || savedAdmin

  const isProvider = user?.isProvider === true;
  const isAdmin = isLoggedIn && localStorage.getItem('isAdmin') === 'true';

  // Sima felhasználó (nem admin és nem szolgáltató)
  const isCustomer = isLoggedIn && !isProvider && !isAdmin;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  }

  return (
    <Router>
      <nav className="navbar navbar-expand navbar-dark bg-dark px-3 shadow fixed-top">
        <div className="container-fluid">
          
          {/* BAL OLDAL */}
          <div className="nav-group">
            <Link className="nav-btn" style={{borderColor: '#0dcaf0'}} to="/">🏠 Főoldal</Link>
            
            {/* Időpontfoglalás: CSAK bejelentkezett VENDÉG látja (Admin és Provider NEM) */}
            {isCustomer && (
              <Link className="nav-link nav-btn" to="/appointments">Időpontfoglalás</Link>
            )}

            {/* Szerepkör alapú gombok */}
            {isCustomer && (
              <Link className="nav-btn" style={{color: '#ffc107', borderColor: '#ffc107'}} to="/my-bookings">
                📅 Foglalásaim
              </Link>
            )}

            {isProvider && (
              <Link className="nav-btn" style={{color: '#0dcaf0', borderColor: '#0dcaf0'}} to="/provider/dashboard">
                💼 Saját üzletem
              </Link>
            )}

            {isAdmin && (
              <Link className="nav-btn" style={{color: '#ff4d4d', borderColor: '#ff4d4d'}} to="/admin/dashboard">
                🛡️ Admin Panel
              </Link>
            )}
          </div>

          {/* JOBB OLDAL */}
          <div className="nav-group">
            {!isLoggedIn ? (
              <>
                <Link className="nav-btn" to="/login">Bejelentkezés</Link>
                <Link className="nav-btn" to="/register">Regisztráció</Link>
              </>
            ) : (
              <>
                <span className="user-info-text d-none d-md-inline">
                  <strong>{user?.name}</strong>
                </span>
                <button className="logout-btn" onClick={handleLogout}>
                  Kijelentkezés
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="content-area container mt-4">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} isAdmin={isAdmin} isProvider={isProvider} user={user} isCustomer={isCustomer} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/appointments" element={isCustomer ? <AppointmentBooking /> : <Navigate to="/" />} />
          <Route path="/my-bookings" element={isCustomer ? <UserBookings /> : <Navigate to="/" />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />} />
          <Route path="/provider/dashboard" element={(isLoggedIn && isProvider) ? <ProviderDashboard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home = ({ isLoggedIn, isAdmin, isProvider, user, isCustomer }) => (
  <div className="text-center py-5 mt-5 glass-panel shadow-lg">
    <h1 className="display-4 fw-bold">Időpontfoglaló</h1>
    {isLoggedIn ? (
      <div className="mt-3">
        <p className="lead">Szia, <strong>{user?.name}</strong>! Örülünk, hogy újra itt vagy.</p>
        
        <div className="d-flex justify-content-center gap-3 mt-4">
          {/* Admin gombja */}
          {isAdmin && (
            <Link to="/admin/dashboard" className="btn btn-danger btn-lg px-4 shadow">Irány az Admin Panel</Link>
          )}

          {/* Szolgáltató gombja */}
          {isProvider && (
            <Link to="/provider/dashboard" className="btn btn-info btn-lg px-4 shadow text-white">Irány a vezérlőpultom</Link>
          )}

          {/* Vendég gombjai (Admin nem látja) */}
          {isCustomer && (
            <>
              <Link to="/appointments" className="btn btn-primary btn-lg px-4 shadow">Időpontot keresek</Link>
              <Link to="/my-bookings" className="btn btn-outline-dark btn-lg px-4">Foglalásaim kezelése</Link>
            </>
          )}
        </div>
      </div>
    ) : (
      <div>
        <p className="lead mt-3 text-muted">A funkciók eléréséhez jelentkezz be!</p>
        <Link to="/login" className="btn btn-dark btn-lg mt-2 px-5">Kezdjünk hozzá</Link>
      </div>
    )}
  </div>
);

export default App;