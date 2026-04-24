  import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
  import logo from './assets/logo.png'
  import Login from './pages/Login';
  import Register from './pages/Register';
  import AdminLogin from './pages/AdminLogin';
  import AdminDashboard from './pages/AdminDashboard';
  import ProviderDashboard from './pages/ProviderDashboard';
  import AppointmentBooking from './pages/AppointmentBooking';
  import BookingPage from './pages/BookingPage';
  import UserBookings from './pages/UserBookings';
  import ReviewForm from './pages/ReviewForm';
  import './App.css';

  function App() {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    
    const savedUser = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
    const savedAdmin = isLoggedIn ? JSON.parse(localStorage.getItem('admin')) : null;

    const user = savedUser || savedAdmin;

    const isProvider = user?.isProvider === true;
    const isAdmin = isLoggedIn && localStorage.getItem('isAdmin') === 'true';

    // Meghatározzuk, ki NEM személyzet (tehát ki írhat review-t)
    const isNotStaff = !isProvider && !isAdmin;

    const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/';
    }

    return (
      <Router>
        <nav className="navbar navbar-expand navbar-dark px-3 shadow fixed-top">
          <div className="container-fluid">
            
            <div className="nav-group">
              <Link className="navbar-brand p-0 m-0 d-flex align-items-center" to="/">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="navbar-logo"
                />
              </Link>
              
              {/* Időpontfoglalás elérése (Csak ha be van jelentkezve ÉS nem személyzet) */}
              {isLoggedIn && isNotStaff && (
                <Link className="nav-link nav-btn" to="/appointments">Időpontfoglalás</Link>
              )}

              {isNotStaff && isLoggedIn && (
                <Link className="nav-btn" style={{color: '#ffc107', borderColor: '#ffc107'}} to="/my-bookings">
                  📅 Foglalásaim
                </Link>
              )}

              {isProvider && (
                <Link className="nav-btn" style={{color: '#0dcaf0', borderColor: '#0dcaf0'}} to="/provider/dashboard">
                  💼 Saját profil
                </Link>
              )}

              {isAdmin && (
                <Link className="nav-btn" style={{color: '#ff4d4d', borderColor: '#ff4d4d'}} to="/admin/dashboard">
                  🛡️ Admin Panel
                </Link>
              )}
            </div>

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
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} isAdmin={isAdmin} isProvider={isProvider} user={user} isNotStaff={isNotStaff} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Védelem: Ha admin vagy provider próbálna ide menni, visszadobjuk a főoldalra */}
            <Route path="/appointments" element={isNotStaff ? <AppointmentBooking /> : <Navigate to="/" />} />
            <Route path="/my-bookings" element={isNotStaff && isLoggedIn ? <UserBookings /> : <Navigate to="/" />} />
            <Route path="/book/:providerId" element={<BookingPage />} />

            {/* Értékelő form: Csak ha NEM admin és NEM provider */}
            <Route 
              path="/add-review/:providerId/:serviceId" 
              element={isNotStaff ? <ReviewForm /> : <Navigate to="/" />} 
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

const Home = ({ isLoggedIn, isAdmin, isProvider, user, isNotStaff }) => (
  <div className="container content-area">
    <div className="row justify-content-center">
      <div className="col-md-10 col-lg-8 glass-panel shadow-lg mt-5 text-center">
        
        <h1 className="display-2 mb-4 fw-bold animate-fade-in">
          <span style={{ color: 'var(--accent-blue)' }}>Időpont</span>
          <span style={{ color: 'var(--white)' }}>foglaló</span>
        </h1>
        
        {isLoggedIn ? (
          <div className="mt-4">
            <p className="lead fs-3 mb-2" style={{ color: '#000000' }}>
              Üdvözlünk újra, <span style={{ fontWeight: '700' }}>{user?.name}</span>! 👋
            </p>
            <p className="text-muted mb-5">Válassz az alábbi műveletek közül az induláshoz:</p>
            
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {isAdmin && (
                <Link to="/admin/dashboard" className="nav-btn nav-btn-highlight px-5 py-3 fs-5">
                  🛡️ Rendszerfelügyelet
                </Link>
              )}

              {isProvider && (
                <Link to="/provider/dashboard" className="nav-btn nav-btn-highlight px-5 py-3 fs-5">
                  💼 Üzletvezetés
                </Link>
              )}

              {isNotStaff && (
                <>
                  <Link to="/appointments" className="nav-btn nav-btn-highlight px-5 py-3 fs-5">
                    🚀 Új időpontot foglalok
                  </Link>
                  <Link to="/my-bookings" className="nav-btn px-5 py-3 fs-5">
                    📅 Foglalásaim
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="py-5 mt-2 d-flex flex-column align-items-center">
            <p 
              className="lead mb-5 text-light fs-4" 
              style={{ 
                maxWidth: '600px', 
                opacity: 0.9, 
                textAlign: 'center',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              A legegyszerűbb és leggyorsabb út a szolgáltatásokhoz. 
              Foglalj időpontot pár kattintással, bárhol, bármikor.
            </p>
            
            <div className="d-flex justify-content-center gap-4 flex-wrap w-100">
              <Link to="/login" className="nav-btn nav-btn-highlight px-5 py-3 fs-5">
                Bejelentkezés
              </Link>
              <Link to="/register" className="nav-btn px-5 py-3 fs-5">
                Regisztráció
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

  export default App;