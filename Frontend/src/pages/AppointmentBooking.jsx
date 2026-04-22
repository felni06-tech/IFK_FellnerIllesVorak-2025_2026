import { useState, useEffect } from 'react';
import api from '../api/axios';

const AppointmentBooking = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Szabad időpontok betöltése
    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/appointments/available');
            setAppointments(res.data.appointments || []);
            setLoading(false);
        } catch (err) {
            setError("Nem sikerült betölteni az időpontokat.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // 2. Foglalás kezelése
    const handleBook = async (appointmentId) => {
        if (!window.confirm("Biztosan le szeretnéd foglalni ezt az időpontot?")) return;

        try {
            // A te backend útvonalad: POST /api/bookings
            const res = await api.post('/bookings', { appointmentId });
            alert(res.data.message || "Sikeres foglalás!");
            
            // Frissítjük a listát, hogy az imént lefoglalt időpont eltűnjön
            fetchAppointments();
        } catch (err) {
            alert(err.response?.data?.message || "Hiba történt a foglalás során.");
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center fw-bold">Elérhető Időpontok</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row">
                {appointments.length === 0 ? (
                    <div className="col-12 text-center">
                        <p className="text-muted">Jelenleg nincsenek szabad időpontok.</p>
                    </div>
                ) : (
                    appointments.map((app) => (
                        <div key={app.appointment_id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body">
                                    <h5 className="card-title fw-bold text-primary">{app.service_name}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">
                                        <i className="bi bi-person-badge me-2"></i>{app.provider_name}
                                    </h6>
                                    <hr />
                                    <p className="card-text mb-1">
                                        <i className="bi bi-calendar-event me-2"></i>
                                        {new Date(app.start_at).toLocaleDateString('hu-HU')}
                                    </p>
                                    <p className="card-text mb-3 text-success fw-bold">
                                        <i className="bi bi-clock me-2"></i>
                                        {new Date(app.start_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fs-5 fw-bold">{app.price} Ft</span>
                                        <button 
                                            className="btn btn-primary px-4 fw-bold shadow-sm"
                                            onClick={() => handleBook(app.appointment_id)}
                                        >
                                            Foglalás
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AppointmentBooking;