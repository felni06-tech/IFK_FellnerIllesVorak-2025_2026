import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import api from '../api/axios';
import 'react-calendar/dist/Calendar.css';

const BookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { providerName, appointments } = location.state || {};
    const [selectedDate, setSelectedDate] = useState(new Date());

    if (!providerName) {
        return <div className="text-white p-5">Hiba: Hiányzó adatok. <button onClick={() => navigate('/')}>Vissza</button></div>;
    }

    const handleBook = async (appointmentId) => {
        if (!window.confirm("Biztosan lefoglalod?")) return;
        try {
            await api.post('/bookings', { appointmentId });
            alert("Sikeres foglalás!");
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || "Hiba történt.");
        }
    };

    const dailyAppointments = appointments.filter(
        a => new Date(a.start_at).toDateString() === selectedDate.toDateString()
    );

    return (
        <div className="container py-5" style={{ background: 'var(--dark-bg)', minHeight: '100vh', color: 'white' }}>
            <button className="btn btn-outline-info mb-4" onClick={() => navigate(-1)}>← Vissza</button>
            
            <div className="row g-4">
                {/* BAL OLDAL: Naptár */}
                <div className="col-lg-6">
                    <div className="glass-panel p-4 h-100">
                        <h2 className="mb-4 fw-bold">{providerName}</h2>
                        <h5 className="text-info mb-3">Válassz egy napot:</h5>
                        <div className="calendar-wrapper">
                            <Calendar 
                                onChange={setSelectedDate} 
                                value={selectedDate} 
                                locale="hu-HU"
                                className="modern-calendar"
                            />
                        </div>
                    </div>
                </div>

                {/* JOBB OLDAL: Időpontok */}
                <div className="col-lg-6">
                    <div className="glass-panel p-4 h-100">
                        <h5 className="text-info mb-4 fw-bold">
                            {selectedDate.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })} - szabad időpontok:
                        </h5>
                        <div className="appointment-grid">
                            {dailyAppointments.length > 0 ? (
                                dailyAppointments.map(app => (
                                    <div key={app.appointment_id} className="time-slot-card animate-fade-in">
                                        <div className="fs-4 fw-bold">{new Date(app.start_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="text-info small mb-3">{app.price} Ft</div>
                                        <button className="nav-btn-highlight w-100 py-2" onClick={() => handleBook(app.appointment_id)}>
                                            Lefoglalom
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted mt-4">Nincs szabad időpont erre a napra.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
    .modern-calendar {
        width: 100% !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 15px;
        color: white !important;
        padding: 10px;
        font-family: inherit;
    }

    /* Alap gombok (napok) stílusa */
    .react-calendar__tile { 
        color: white !important; 
        height: 60px; 
        transition: all 0.2s ease;
        border-radius: 8px;
    }

    /* A MAI nap egyedi jelölése (sötétebb kék) */
    .react-calendar__tile--now {
        background: rgba(0, 50, 150, 0.4) !important; /* Mélykék, áttetsző */
        border: 1px solid rgba(0, 210, 255, 0.3) !important;
        color: #00d2ff !important; /* A betű színe legyen kicsit ciánosabb */
    }

    /* HOVER effekt - olvashatóan */
    .react-calendar__tile:enabled:hover {
        background: rgba(0, 210, 255, 0.15) !important; /* Nagyon finom világoskék */
        color: white !important;
    }

    /* KIVÁLASZTOTT nap stílusa */
    .react-calendar__tile--active {
        background: var(--accent-blue) !important;
        color: black !important; /* Itt a fekete betű jobb kontrasztot ad a világoskék háttéren */
        font-weight: bold;
    }

    /* Navigációs gombok (hónap váltás) */
    .react-calendar__navigation button { 
        color: white !important; 
        font-size: 1.2rem; 
        min-width: 44px; 
        background: none;
    }
    
    .react-calendar__navigation button:enabled:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
    }

    /* Időpont kártyák grid elrendezése */
    .appointment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
    }

    .time-slot-card {
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        transition: 0.3s ease;
    }

    .time-slot-card:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-5px);
        border-color: var(--accent-blue);
    }
            `}</style>
        </div>
    );
};

export default BookingPage;