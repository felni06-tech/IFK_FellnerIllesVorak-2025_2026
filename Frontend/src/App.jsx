import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import './App.css';

function App() {
  // Adatok kinyerése a tárolóból
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  
  // Felhasználói adatok (csak ha be van jelentkezve)
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
  const isProvider = user?.isProvider === true;
  
  // Admin ellenőrzés: Csak ha be van jelentkezve ÉS az admin jelző is ott van
  const isAdmin = isLoggedIn && localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.clear(); // Mindent törlünk: token, user, isAdmin
    window.location.href = '/';
  }

  return (
    <Router>
      <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
        <div className="container-fluid">
          <div className="navbar-nav w-100">
            <Link className="nav-link" to="/">Főoldal</Link>
            
            {!isLoggedIn ? (
              /* --- KIJELENTKEZETT ÁLLAPOT --- */
              <div className="ms-auto d-flex">
                <Link className="nav-link" to="/login">Bejelentkezés</Link>
                <Link className="nav-link" to="/register">Regisztráció</Link>
              </div>
            ) : (
              /* --- BEJELENTKEZETT ÁLLAPOT --- */
              <div className="ms-auto d-flex align-items-center">
                
                {/* Csak Szolgáltatóknak látható link */}
                {isProvider && (
                  <Link className="nav-link me-3 text-info" to="/provider/dashboard">
                    Saját üzletem
                  </Link>
                )}

                {/* Csak Adminoknak látható link */}
                {isAdmin && (
                  <Link className="nav-link me-3 text-warning fw-bold" to="/admin/dashboard">
                    🛡️ Admin Panel
                  </Link>
                )}

                <span className="navbar-text me-3 text-light border-end pe-3">
                  Bejelentkezve: <strong>{user?.name}</strong>
                </span>

                <button 
                  className="btn btn-outline-light btn-sm" 
                  onClick={handleLogout}
                >
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          {/* Nyilvános utak */}
          <Route path="/" element={
            <div className="text-center py-5">
              <h1 className="display-4">Üdvözöllek a Vizsgaremekben!</h1>
              {isLoggedIn ? (
                <div className="mt-3">
                  <p className="lead text-success">Sikeresen bejelentkeztél!</p>
                  {isAdmin && <p className="badge bg-danger p-2">Adminisztrátori hozzáférés aktív</p>}
                </div>
              ) : (
                <p className="lead mt-3">Kérlek, jelentkezz be a funkciók eléréséhez.</p>
              )}
            </div>
          } />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Adminisztrációs utak */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
              path="/admin/dashboard" 
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />} 
          />

          {/* Szolgáltatói utak */}
          <Route 
              path="/provider/dashboard" 
              element={(isLoggedIn && isProvider) ? <ProviderDashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;