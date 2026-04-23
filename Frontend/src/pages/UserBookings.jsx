import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Behozzuk a Link-et az átirányításhoz
import api from '../api/axios';

const UserBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/bookings/my-bookings');
            setBookings(res.data.bookings || []);
            setLoading(false);
        } catch (err) {
            setError("Nem sikerült betölteni a foglalásaidat.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        if (!bookingId) {
            alert("Hiba: Nem található a foglalás azonosítója.");
            return;
        }
        if (!window.confirm("Biztosan le szeretnéd mondani ezt a foglalást?")) return;

        try {
            await api.patch(`/bookings/${bookingId}/cancel`);
            alert("Foglalás sikeresen lemondva!");
            fetchMyBookings();
        } catch (err) {
            alert(err.response?.data?.message || "Hiba történt a lemondás során.");
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "Nincs megadva";
        return new Date(dateValue).toLocaleString('hu-HU', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold text-dark">
                <i className="bi bi-journal-check me-2"></i>Saját foglalásaim
            </h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {bookings.length === 0 ? (
                <div className="card p-5 text-center shadow-sm border-0 bg-light">
                    <p className="text-muted mb-0 font-italic">Még nincs egyetlen foglalásod sem.</p>
                </div>
            ) : (
                <div className="row">
                    {bookings.map((b) => {
                        const bId = b.booking_id || b.id;
                        const isActive = b.booking_status === 'active';

                        return (
                            <div key={bId} className="col-12 mb-3">
                                <div className={`card shadow-sm border-0 border-start border-4 ${
                                    isActive ? 'border-success' : 'border-danger'
                                }`}>
                                    <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                        <div>
                                            <h5 className="fw-bold mb-1">{b.service_name}</h5>
                                            <p className="text-muted mb-2 small">
                                                <i className="bi bi-geo-alt me-1"></i>{b.provider_name} | {b.address}
                                            </p>
                                            <div className="d-flex align-items-center">
                                                <span className="badge bg-light text-dark border me-2">
                                                    <i className="bi bi-calendar3 me-1"></i>{formatDate(b.start_at)}
                                                </span>
                                                <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'}`}>
                                                    {isActive ? 'Aktív' : 'Lemondva'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 mt-md-0 d-flex gap-2 align-items-center">
                                            {isActive ? (
                                                <>
                                                    {/* ÚJ: Értékelés gomb */}
                                                    <Link 
                                                        to={`/add-review/${b.provider_id}/${b.service_id}`}
                                                        className="btn btn-warning btn-sm fw-bold px-3 shadow-sm"
                                                    >
                                                        <i className="bi bi-star-fill me-1"></i>Értékelés
                                                    </Link>

                                                    <button 
                                                        className="btn btn-outline-danger btn-sm fw-bold px-3"
                                                        onClick={() => handleCancel(bId)}
                                                    >
                                                        <i className="bi bi-x-circle me-1"></i>Lemondás
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-danger small fw-bold italic text-uppercase">
                                                    Törölt foglalás
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserBookings;