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
  
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
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
      <nav className="navbar navbar-expand navbar-dark bg-dark px-3 shadow">
        <div className="container-fluid">
          <div className="navbar-nav w-100 align-items-center">
            <Link className="nav-link fw-bold" to="/">🏠 Főoldal</Link>
            
            {/* MODOSÍTVA: Csak bejelentkezett VENDÉGEK (vagy Adminok) látják az időpontfoglalás linket, a Provider NEM */}
            {isLoggedIn && !isProvider && (
              <Link className="nav-link" to="/appointments">Időpontfoglalás</Link>
            )}

            {!isLoggedIn ? (
              <div className="ms-auto d-flex">
                <Link className="nav-link" to="/login">Bejelentkezés</Link>
                <Link className="nav-link" to="/register">Regisztráció</Link>
              </div>
            ) : (
              <div className="ms-auto d-flex align-items-center">
                
                {isCustomer && (
                  <Link className="nav-link me-3 text-warning" to="/my-bookings">
                    📅 Foglalásaim
                  </Link>
                )}

                {isProvider && (
                  <Link className="nav-link me-3 text-info" to="/provider/dashboard">
                    💼 Saját üzletem
                  </Link>
                )}

                {isAdmin && (
                  <Link className="nav-link me-3 text-danger fw-bold" to="/admin/dashboard">
                    🛡️ Admin Panel
                  </Link>
                )}

                <span className="navbar-text me-3 text-light border-end pe-3 border-secondary">
                  <strong>{user?.name}</strong>
                </span>

                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} isAdmin={isAdmin} isProvider={isProvider} user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Vendég utak - itt is érdemes korlátozni, hogy Provider ne tudjon manuálisan odanavigálni */}
          <Route 
              path="/appointments" 
              element={(isLoggedIn && !isProvider) ? <AppointmentBooking /> : <Navigate to="/" />} 
          />
          <Route 
              path="/my-bookings" 
              element={(isLoggedIn && !isProvider) ? <UserBookings /> : <Navigate to="/" />} 
          />

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />} />
          <Route path="/provider/dashboard" element={(isLoggedIn && isProvider) ? <ProviderDashboard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

// MODOSÍTVA: Home komponens, hogy Provider ne lássa a foglalás gombokat
const Home = ({ isLoggedIn, isAdmin, isProvider, user }) => (
  <div className="text-center py-5">
    <h1 className="display-4 fw-bold">Vizsgaremek Időpontfoglaló</h1>
    {isLoggedIn ? (
      <div className="mt-3">
        <p className="lead text-success">Szia, <strong>{user?.name}</strong>! Örülünk, hogy újra itt vagy.</p>
        
        <div className="d-flex justify-content-center gap-3">
          {/* Ha Provider, akkor a saját üzletéhez dobjuk gombot, ha nem, akkor a foglaláshoz */}
          {isProvider ? (
            <Link to="/provider/dashboard" className="btn btn-info btn-lg px-4 shadow text-white">Irány a vezérlőpultom</Link>
          ) : (
            <>
              <Link to="/appointments" className="btn btn-primary btn-lg px-4 shadow">Időpontot keresek</Link>
              <Link to="/my-bookings" className="btn btn-outline-dark btn-lg px-4">Foglalásaim kezelése</Link>
            </>
          )}
        </div>
        
        {isAdmin && <p className="mt-4 badge bg-danger p-2">Rendszergazdai jogosultság észlelve</p>}
      </div>
    ) : (
      <div>
        <p className="lead mt-3 text-muted">A funkciók eléréséhez jelentkezz be!</p>
        <Link to="/login" className="btn btn-dark btn-lg mt-2">Kezdjünk hozzá</Link>
      </div>
    )}
  </div>
);

export default App;