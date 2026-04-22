import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  return (
    <Router>
      <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
        <div className="container-fluid">
          <div className="navbar-nav w-100">
            <Link className="nav-link" to="/">Főoldal</Link>
            
            {!isLoggedIn ? (
              <div className="ms-auto d-flex"> {/* 2. Konténer a két linknek */}
                <Link className="nav-link" to="/login">Bejelentkezés</Link>
                <Link className="nav-link" to="/register">Regisztráció</Link>
              </div>
            ) : (
              <button 
                className="nav-link btn btn-link ms-auto text-decoration-none" 
                onClick={handleLogout}
              >
                Kijelentkezés
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={
            <div className="text-center">
              <h1>Üdvözöllek a Vizsgaremekben!</h1>
              {isLoggedIn ? (
                <p className="text-success">Sikeresen be vagy jelentkezve!</p>
              ) : (
                <p>Kérlek, jelentkezz be a funkciók eléréséhez.</p>
              )}
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
              path="/admin/dashboard" 
              element={localStorage.getItem('isAdmin') === 'true' ? <AdminDashboard /> : <Navigate to="/admin" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;