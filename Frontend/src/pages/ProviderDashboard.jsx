import { useState, useEffect } from 'react';
import api from '../api/axios';

const ProviderDashboard = () => {
    const [profile, setProfile] = useState({
        address: '',
        description: '',
        price: '',
        duration_minutes: ''
    });
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ÚJ: Állapot az időpont generáláshoz ---
    const [genData, setGenData] = useState({
        start_time: '',
        end_time: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const profileRes = await api.get('/provider/me');
                if (profileRes.data) {
                    setProfile({
                        address: profileRes.data.address || '',
                        description: profileRes.data.description || '',
                        price: profileRes.data.price || '',
                        duration_minutes: profileRes.data.duration_minutes || ''
                    });
                }
                
                const bookingsRes = await api.get('/provider/bookings');
                setBookings(bookingsRes.data.bookings || []);

                const reviewsRes = await api.get('/provider/reviews');
                setReviews(reviewsRes.data.reviews || []);
                
                setLoading(false);
            } catch (err) {
                console.error("Hiba az adatok betöltésekor:", err);
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.post('/provider/update', profile);
            alert("Profil sikeresen frissítve!");
        } catch (err) {
            alert("Hiba a frissítés során: " + (err.response?.data?.message || "Szerverhiba"));
        }
    };

    // --- ÚJ: Függvény az időpontok generálásához ---
    const handleGenerateSlots = async (e) => {
        e.preventDefault();
        
        // Alapvető validáció
        if (new Date(genData.end_time) <= new Date(genData.start_time)) {
            alert("A befejezési időpontnak később kell lennie, mint a kezdésnek!");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await api.post('/appointments/generate', genData);
            alert(response.data.message || "Időpontok sikeresen létrehozva!");
            // Mezők ürítése siker után
            setGenData({ start_time: '', end_time: '' });
        } catch (err) {
            alert("Hiba a generálás során: " + (err.response?.data?.message || "Szerverhiba"));
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "Nincs időpont";
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "Hibás dátum";
        return date.toLocaleString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    if (loading) return (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-2">Adatok betöltése...</p>
        </div>
    );

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-primary fw-bold">Szolgáltatói Vezérlőpult</h2>
            
            <div className="row">
                <div className="col-lg-4 col-md-5 mb-4">
                    
                    {/* --- IDŐPONT GENERÁTOR SZEKCIÓ --- */}
                    <div className="card shadow-sm p-4 border-0 mb-4 text-white" style={{ backgroundColor: '#4e73df' }}>
                        <h4 className="fw-bold mb-3">📅 Időpontok generálása</h4>
                        <form onSubmit={handleGenerateSlots}>
                            <div className="mb-2">
                                <label className="form-label small fw-bold">Műszak kezdete</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control form-control-sm" 
                                    value={genData.start_time}
                                    onChange={e => setGenData({...genData, start_time: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Műszak vége</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control form-control-sm" 
                                    value={genData.end_time}
                                    onChange={e => setGenData({...genData, end_time: e.target.value})}
                                    required 
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-light btn-sm w-100 fw-bold text-primary shadow-sm"
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generálás...' : 'Szabad sávok létrehozása'}
                            </button>
                        </form>
                    </div>

                    {/* PROFIL SZERKESZTÉSE */}
                    <div className="card shadow-sm p-4 border-0 bg-light">
                        <h4 className="border-bottom pb-2">Üzleti profilom</h4>
                        <form onSubmit={handleUpdateProfile} className="mt-3">
                            <div className="mb-2">
                                <label className="form-label fw-bold">Helyszín / Cím</label>
                                <input type="text" className="form-control" value={profile.address} 
                                    onChange={e => setProfile({...profile, address: e.target.value})} required />
                            </div>
                            <div className="mb-2">
                                <label className="form-label fw-bold">Bemutatkozás</label>
                                <textarea className="form-control" rows="3" value={profile.description} 
                                    onChange={e => setProfile({...profile, description: e.target.value})} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label fw-bold">Alapár (Ft)</label>
                                <input type="number" className="form-control" value={profile.price} 
                                    onChange={e => setProfile({...profile, price: e.target.value})} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Szolgáltatási idő (perc)</label>
                                <input type="number" className="form-control" value={profile.duration_minutes} 
                                    onChange={e => setProfile({...profile, duration_minutes: e.target.value})} required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 shadow-sm fw-bold">Profil mentése</button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-8 col-md-7">
                    {/* FOGLALÁSOK TÁBLÁZATA */}
                    <div className="card shadow-sm p-4 mb-4 border-0">
                        <h4 className="border-bottom pb-2 text-success">Aktuális foglalások</h4>
                        {bookings.length === 0 ? (
                            <p className="text-muted mt-3 italic">Nincsenek beérkező foglalások.</p>
                        ) : (
                            <div className="table-responsive mt-2">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Ügyfél neve</th>
                                            <th>Időpont</th>
                                            <th>Állapot</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.booking_id}>
                                                <td>
                                                    <strong>{b.customer_name}</strong><br/>
                                                    <small className="text-muted">{b.service_name}</small>
                                                </td>
                                                <td>{formatDate(b.start_at)}</td>
                                                <td>
                                                    <span className={`badge rounded-pill ${
                                                            b.booking_status === 'confirmed' || b.booking_status === 'active' ? 'bg-success' : 
                                                            b.booking_status === 'cancelled' ? 'bg-danger' : 
                                                            'bg-warning text-dark'
                                                        }`}>
                                                        {b.booking_status === 'active' && 'Aktív'}
                                                        {b.booking_status === 'confirmed' && 'Visszaigazolva'}
                                                        {b.booking_status === 'cancelled' && 'Lemondva'}
                                                        {b.booking_status === 'pending' && 'Függőben'}
                                                        {!['active', 'confirmed', 'cancelled', 'pending'].includes(b.booking_status) && b.booking_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* VÉLEMÉNYEK SZEKCIÓ */}
                    <div className="card shadow-sm p-4 border-0">
                        <h4 className="border-bottom pb-2 text-warning">Legutóbbi értékelések</h4>
                        {reviews.length === 0 ? (
                            <p className="text-muted mt-3 italic">Még nem érkezett szöveges értékelés.</p>
                        ) : (
                            <div className="mt-3">
                                {reviews.map((r, index) => (
                                    <div key={r.id || index} className="border-bottom mb-3 pb-2">
                                        <div className="d-flex justify-content-between">
                                            <h6 className="mb-0 fw-bold">{r.user_name || 'Névtelen látogató'}</h6>
                                            <span className="text-warning">
                                                {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                                            </span>
                                        </div>
                                        <p className="text-secondary small mt-1 mb-1 italic">"{r.comment}"</p>
                                        <small className="text-muted">{formatDate(r.created_at)}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;