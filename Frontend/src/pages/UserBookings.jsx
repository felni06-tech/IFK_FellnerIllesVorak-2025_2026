import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        if (!window.confirm("Biztosan le szeretnéd mondani ezt a foglalást?")) return;
        try {
            await api.patch(`/bookings/${bookingId}/cancel`);
            alert("Foglalás sikeresen lemondva!");
            fetchMyBookings();
        } catch (err) {
            alert(err.response?.data?.message || "Hiba történt.");
        }
    };

    const formatDate = (dateValue) => {
        const date = new Date(dateValue);
        return {
            day: date.toLocaleString('hu-HU', { day: '2-digit', month: 'short' }),
            time: date.toLocaleString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
            full: date.getFullYear()
        };
    };

    if (loading) return (
        <div className="text-center mt-5">
            <div className="spinner-border text-info"></div>
        </div>
    );

    return (
        <div className="container-fluid py-5 px-4" style={{ background: 'var(--dark-bg)', minHeight: '100vh' }}>
            <h2 className="display-6 fw-bold text-white mb-5 ms-2">
                Saját <span style={{ color: 'var(--accent-blue)' }}>Foglalásaim</span>
            </h2>

            {error && <div className="alert alert-danger glass-panel">{error}</div>}

            {bookings.length === 0 ? (
                <div className="glass-panel p-5 text-center shadow-lg">
                    <p className="text-muted fs-4">Még nincs egyetlen foglalásod sem.</p>
                    <Link to="/appointments" className="nav-btn-highlight px-4 py-2 mt-3 d-inline-block text-decoration-none">
                        Időpontot keresek
                    </Link>
                </div>
            ) : (
                <div className="row g-4">
                    {/* RENDEZÉS: Dátum szerint növekvő sorrend (legkorábbi elöl) */}
                    {[...bookings]
                        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
                        .map((b) => {
                        const bId = b.booking_id || b.id;
                        const isActive = b.booking_status === 'active';
                        const date = formatDate(b.start_at);

                        return (
                            <div key={bId} className="col-xl-4 col-md-6 animate-fade-in">
                                <div className={`booking-card-netflix ${!isActive ? 'cancelled' : ''}`}>
                                    
                                    <div className="booking-date-poster">
                                        <span className="year">{date.full}</span>
                                        <span className="day">{date.day}</span>
                                        <span className="time">{date.time}</span>
                                    </div>

                                    <div className="booking-content">
                                        <div className="mb-auto">
                                            <div className="service-category">{b.service_name}</div>
                                            <h4 className="provider-name">{b.provider_name}</h4>
                                            <p className="address-text">
                                                <i className="bi bi-geo-alt-fill me-1"></i>{b.address}
                                            </p>
                                        </div>

                                        <div className="booking-actions">
                                            {isActive ? (
                                                <>
                                                    <Link 
                                                        to={`/add-review/${b.provider_id}/${b.service_id}`}
                                                        className="action-link review text-decoration-none"
                                                    >
                                                        <i className="bi bi-star-fill me-1"></i> Értékelés
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleCancel(bId)}
                                                        className="action-link cancel"
                                                    >
                                                        <i className="bi bi-trash me-1"></i> Lemondás
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="status-cancelled">LEMONDVA</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .booking-card-netflix {
                    display: flex;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    overflow: hidden;
                    height: 180px;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .booking-card-netflix:hover {
                    transform: scale(1.02);
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--accent-blue);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                .booking-card-netflix.cancelled {
                    opacity: 0.6;
                    filter: grayscale(0.8);
                }

                .booking-date-poster {
                    background: linear-gradient(135deg, var(--accent-blue), #0056b3);
                    min-width: 100px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }

                .booking-date-poster .year { font-size: 0.7rem; opacity: 0.8; }
                .booking-date-poster .day { font-size: 1.4rem; text-transform: uppercase; line-height: 1; margin: 5px 0; }
                .booking-date-poster .time { font-size: 0.9rem; background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 20px; }

                .booking-content {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }

                .service-category {
                    color: var(--accent-blue);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    font-weight: 800;
                    margin-bottom: 5px;
                }

                .provider-name {
                    color: white;
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .address-text {
                    color: #aaa;
                    font-size: 0.85rem;
                    margin-top: 5px;
                }

                .booking-actions {
                    display: flex;
                    gap: 15px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 15px;
                    margin-top: 10px;
                }

                .action-link {
                    background: none;
                    border: none;
                    font-size: 0.85rem;
                    font-weight: bold;
                    text-decoration: none;
                    transition: 0.2s;
                    padding: 0;
                }

                .action-link.review { color: #ffc107; }
                .action-link.review:hover { color: #ffdb6e; text-shadow: 0 0 10px rgba(255,193,7,0.5); }

                .action-link.cancel { color: #ff4d4d; }
                .action-link.cancel:hover { color: #ff8080; }

                .status-cancelled {
                    color: #666;
                    font-size: 0.8rem;
                    letter-spacing: 2px;
                    font-weight: bold;
                }

                @media (max-width: 576px) {
                    .booking-card-netflix { height: auto; flex-direction: column; }
                    .booking-date-poster { flex-direction: row; gap: 15px; padding: 10px; min-width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default UserBookings;