import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import './App.css'; // Megtarthatod a stílusokat, ha szeretnéd

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
              <Link className="nav-link ms-auto" to="/login">Bejelentkezés</Link>
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;