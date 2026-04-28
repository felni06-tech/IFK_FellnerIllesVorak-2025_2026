import { useState, useEffect } from 'react';
import api from '../api/axios';

const ProviderDashboard = () => {
    const [profile, setProfile] = useState({
        address: '', description: '', price: '', duration_minutes: ''
    });
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [addressParts, setAddressParts] = useState({
        zip: '', city: '', street: '', houseNumber: ''
    });
    const [genSettings, setGenSettings] = useState({
        date: '', startTime: '08:00', endTime: '16:00'
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [pRes, bRes, rRes] = await Promise.all([
                    api.get('/provider/me'),
                    api.get('/provider/bookings'),
                    api.get('/provider/reviews')
                ]);

                if (pRes.data) {
                    const data = pRes.data;
                    setProfile({
                        address: data.address || '',
                        description: data.description || '',
                        price: data.price || '',
                        duration_minutes: data.duration_minutes || ''
                    });

                    if (data.address && data.address.includes(',')) {
                        const parts = data.address.split(',').map(part => part.trim());
                        setAddressParts({
                            zip: parts[0] || '',
                            city: parts[1] || '',
                            street: parts[2] || '',
                            houseNumber: parts[3] || ''
                        });
                    }
                }
                setBookings(bRes.data.bookings || []);
                setReviews(rRes.data.reviews || []);
                setLoading(false);
            } catch (err) {
                console.error("Hiba az adatok betöltésekor:", err);
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const updateFullAddress = (newParts) => {
        setAddressParts(newParts);
        const { zip, city, street, houseNumber } = newParts;
        const fullAddress = `${zip}, ${city}, ${street}, ${houseNumber}`;
        setProfile(prev => ({ ...prev, address: fullAddress }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.post('/provider/update', profile);
            alert("Profil mentve!");
        } catch (err) { alert("Hiba a mentésnél."); }
    };

    const handleGenerateSlots = async (e) => {
        e.preventDefault();
        if (!genSettings.date) return alert("Kérlek válassz dátumot!");
        setIsGenerating(true);
        try {
            const payload = {
                start_time: `${genSettings.date} ${genSettings.startTime}`,
                end_time: `${genSettings.date} ${genSettings.endTime}`
            };
            await api.post('/appointments/generate', payload);
            alert("Időpontok sikeresen létrehozva!");
        } catch (err) {
            alert("Hiba: " + (err.response?.data?.message || "Szerverhiba"));
        } finally { setIsGenerating(false); }
    };

    if (loading) return <div className="text-center mt-5 text-white">Betöltés...</div>;

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-white fw-bold">Szolgáltatói Vezérlőpult</h2>

            <div className="dashboard-grid-main">

                {/* BAL OSZLOP */}
                <div className="d-flex flex-column gap-4">

                    {/* 1. ÜZLETI PROFIL */}
                    <div className="card glass-panel p-4">
                        <h4 className="fw-bold mb-4 border-bottom pb-2">Üzleti profilom</h4>
                        <form onSubmit={handleUpdateProfile} className="d-flex flex-column gap-3">

                            {/* 1. SOR: Irányítószám és Város */}
                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Irányítószám / Város</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="text" placeholder="ZIP" style={{ width: '80px' }} className="nav-btn"
                                        value={addressParts.zip} onChange={e => updateFullAddress({ ...addressParts, zip: e.target.value })} required
                                    />
                                    <input
                                        type="text" placeholder="település" className="nav-btn flex-grow-1"
                                        value={addressParts.city} onChange={e => updateFullAddress({ ...addressParts, city: e.target.value })} required
                                    />
                                </div>
                            </div>

                            {/* 2. SOR: Utca és Házszám */}
                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Utca / Házszám</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="text" placeholder="utca" className="nav-btn flex-grow-1"
                                        value={addressParts.street} onChange={e => updateFullAddress({ ...addressParts, street: e.target.value })} required
                                    />
                                    <input
                                        type="text" placeholder="hsz." style={{ width: '80px' }} className="nav-btn"
                                        value={addressParts.houseNumber} onChange={e => updateFullAddress({ ...addressParts, houseNumber: e.target.value })} required
                                    />
                                </div>
                            </div>

                            {/* 3. SOR: Bemutatkozás */}
                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Bemutatkozás</label>
                                <textarea
                                    className="nav-btn w-100"
                                    style={{ height: '100px', resize: 'none' }}
                                    value={profile.description}
                                    onChange={e => setProfile({ ...profile, description: e.target.value })}
                                />
                            </div>

                            {/* 4. SOR: Ár és Időtartam */}
                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Ár (Ft)</label>
                                <input type="number" className="nav-btn w-100" value={profile.price} onChange={e => setProfile({ ...profile, price: e.target.value })} required />
                            </div>

                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Időtartam (perc)</label>
                                <input type="number" className="nav-btn w-100" value={profile.duration_minutes} onChange={e => setProfile({ ...profile, duration_minutes: e.target.value })} required />
                            </div>

                            {/* Mentés gomb extra távolsággal (mt-4) */}
                            <button
                                type="submit"
                                className="nav-btn nav-btn-highlight py-2 fw-bold shadow-sm mt-5"
                                style={{ marginTop: '40px' }}
                            >
                                Profil mentése
                            </button>
                        </form>
                    </div>

                    {/* 2. IDŐPONT GENERÁTOR */}
                    <div className="card glass-panel p-4">
                        <h4 className="fw-bold mb-3 border-bottom pb-2 text-info">📅 Időpontok generálása</h4>
                        <form onSubmit={handleGenerateSlots} className="d-flex flex-column gap-3">
                            <div className="address-grid">
                                <div className="form-group-custom">
                                    <label>Dátum</label>
                                    <input type="date" className="nav-btn w-100" value={genSettings.date} onChange={e => setGenSettings({ ...genSettings, date: e.target.value })} required />
                                </div>
                                <div className="form-group-custom">
                                    <label>Műszak (tól - ig)</label>
                                    <div className="d-flex gap-2 align-items-center">
                                        <input type="time" className="nav-btn flex-1" value={genSettings.startTime} onChange={e => setGenSettings({ ...genSettings, startTime: e.target.value })} required />
                                        <span className="text-white">-</span>
                                        <input type="time" className="nav-btn flex-1" value={genSettings.endTime} onChange={e => setGenSettings({ ...genSettings, endTime: e.target.value })} required />
                                    </div>
                                </div>
                            </div>
                            {/* Időpont létrehozása gomb */}
                            <button 
                                type="submit" 
                                className="nav-btn py-2 fw-bold mt-5" 
                                style={{ 
                                    background: 'var(--primary-blue)', 
                                    border: 'none',
                                    marginTop: '40px'
                                }}
                            >
                                {isGenerating ? 'Folyamatban...' : 'Időpontok létrehozása'}
                            </button>
                        </form>
                    </div>

                    {/* 3. FOGLALÁSOK */}
                    <div className="card glass-panel p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                            <h4 className="fw-bold m-0" style={{ color: 'var(--accent-blue)' }}>
                                <i className="bi bi-calendar-check me-2"></i>Aktív foglalások
                            </h4>
                            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3">
                                {bookings.length} foglalás
                            </span>
                        </div>

                        {/* Eltávolítottuk a scroll-container osztályt, vagy módosítottuk a viselkedését */}
                        <div className="booking-dynamic-container">
                            {bookings.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {[...bookings]
                                        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
                                        .map((b, i) => {
                                            const dateObj = new Date(b.start_at);
                                            const day = dateObj.toLocaleString('hu-HU', { day: '2-digit', month: 'short' });
                                            const time = dateObj.toLocaleString('hu-HU', { hour: '2-digit', minute: '2-digit' });
                                            const year = dateObj.getFullYear();

                                            return (
                                                <div key={i} className="provider-booking-card">
                                                    <div className="date-poster-blue">
                                                        <span className="year">{year}</span>
                                                        <span className="day">{day}</span>
                                                        <span className="time">{time}</span>
                                                    </div>

                                                    <div className="card-body-content">
                                                        <div className="client-info">
                                                            <div className="label-text-blue">ÜGYFÉL</div>
                                                            <h5 className="client-name">{b.customer_name}</h5>
                                                        </div>
                                                        
                                                        <div className="booking-footer">
                                                            <span className="info-tag">
                                                                <i className="bi bi-clock me-1"></i>{profile.duration_minutes} perc
                                                            </span>
                                                            <span className="info-tag highlighted">
                                                                {profile.price} Ft
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="accent-bar-blue"></div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-5 opacity-50">
                                    <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                                    <p className="small m-0">Nincsenek aktív foglalások a rendszerben.</p>
                                </div>
                            )}
                        </div>

                        <style>{`
                            /* A fix magasság és görgetés eltávolítva */
                            .booking-dynamic-container {
                                width: 100%;
                                height: auto;
                                overflow: visible; /* Biztosítjuk, hogy ne legyen görgetősáv */
                            }

                            .provider-booking-card {
                                display: flex;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 12px;
                                overflow: hidden;
                                transition: all 0.3s ease;
                                height: 110px;
                                flex-shrink: 0; /* Megakadályozzuk, hogy összenyomódjanak */
                            }

                            .provider-booking-card:hover {
                                background: rgba(255, 255, 255, 0.08);
                                transform: scale(1.01) translateX(5px);
                                border-color: var(--accent-blue);
                                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                            }

                            .date-poster-blue {
                                background: linear-gradient(135deg, var(--accent-blue), #0056b3);
                                min-width: 90px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: bold;
                            }

                            .date-poster-blue .year { font-size: 0.65rem; opacity: 0.8; }
                            .date-poster-blue .day { font-size: 1.1rem; text-transform: uppercase; line-height: 1.2; margin: 2px 0; }
                            .date-poster-blue .time { font-size: 0.85rem; background: rgba(0,0,0,0.2); padding: 1px 6px; border-radius: 10px; }

                            .card-body-content {
                                padding: 15px 20px;
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                                flex-grow: 1;
                            }

                            .label-text-blue {
                                color: var(--accent-blue);
                                font-size: 0.65rem;
                                letter-spacing: 1.2px;
                                font-weight: 800;
                                margin-bottom: 2px;
                            }

                            .client-name {
                                color: white;
                                margin: 0;
                                font-size: 1.15rem;
                                font-weight: 700;
                            }

                            .booking-footer {
                                display: flex;
                                gap: 12px;
                                align-items: center;
                            }

                            .info-tag {
                                font-size: 0.75rem;
                                color: #ffffff;
                                background: rgba(255,255,255,0.05);
                                padding: 2px 8px;
                                border-radius: 5px;
                            }

                            .info-tag.highlighted {
                                color: #fff;
                                font-weight: bold;
                                background: rgba(0, 212, 255, 0.1);
                            }

                            .accent-bar-blue {
                                width: 4px;
                                background: var(--accent-blue);
                                opacity: 0.6;
                            }

                            @media (max-width: 576px) {
                                .provider-booking-card { height: auto; min-height: 100px; }
                                .date-poster-blue { min-width: 75px; padding: 10px; }
                            }
                        `}</style>
                    </div>
                </div>

                {/* JOBB OSZLOP: Vélemények */}
                <div className="card glass-panel p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                        <h4 className="fw-bold m-0 text-warning">
                            <i className="bi bi-chat-square-quote me-2"></i>Összes értékelés
                        </h4>
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3">
                            {reviews.length} db
                        </span>
                    </div>

                    <div className="d-flex flex-column gap-5">
                        {reviews.length > 0 ? (
                            [...reviews].reverse().map((r, i) => (
                                <div key={i} className="review-card-modern shadow-lg">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="d-flex align-items-center">
                                            <div className="review-avatar-mini me-2">
                                                {r.customer_name ? r.customer_name.charAt(0).toUpperCase() : 'V'}
                                            </div>
                                            <div>
                                                <div className="small fw-bold text-white leading-tight">
                                                    {r.customer_name || 'Vendég'}
                                                </div>
                                                <div className="text-warning" style={{ fontSize: '0.75rem' }}>
                                                    {'★'.repeat(r.rating)}
                                                    <span style={{ opacity: 0.3 }}>{'★'.repeat(5 - r.rating)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="review-body">
                                        <p className="small m-0 text-white-50 italic" style={{ lineHeight: '1.6' }}>
                                            "{r.comment}"
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5 glass-card-simple rounded-4">
                                <i className="bi bi-chat-dots fs-1 d-block mb-2 opacity-20"></i>
                                <p className="small m-0 opacity-50">Még nem érkezett értékelés.</p>
                            </div>
                        )}
                    </div>

                    <style>{`
                        .review-card-modern {
                            background: rgba(255, 255, 255, 0.03);
                            backdrop-filter: blur(12px);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 24px; /* Még kerekebb, modernebb */
                            padding: 24px;
                            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                            margin-bottom: 5px; /* Extra fizikai távolság */
                        }

                        .review-card-modern:hover {
                            background: rgba(255, 255, 255, 0.08);
                            border-color: var(--accent-blue);
                            transform: translateY(-8px) scale(1.01);
                            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
                        }

                        .review-avatar-mini {
                            width: 42px;
                            height: 42px;
                            background: linear-gradient(135deg, var(--accent-blue), #0056b3);
                            color: white;
                            border-radius: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1rem;
                            font-weight: bold;
                            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
                        }

                        .review-body {
                            margin-top: 15px;
                            padding-left: 18px;
                            border-left: 3px solid var(--accent-blue);
                            position: relative;
                        }

                        .italic { font-style: italic; }
                        .leading-tight { line-height: 1.2; }
                    `}</style>
                </div>
            </div>

            <style>{`
                .dashboard-grid-main {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 1.5rem;
                    align-items: start;
                }

                .address-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .address-grid-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr; /* Két egyenlő oszlop */
                    gap: 1.5rem; /* Távolság a két blokk között */
                    width: 100%;
                }

                .form-group-custom {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group-custom label {
                    font-size: 0.85rem;
                    font-weight: bold;
                    opacity: 0.8;
                    color: white;
                }

                .glass-panel {
                    background: var(--glass-bg);
                    backdrop-filter: blur(15px);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    color: white;
                }

                .nav-btn {
                    background: rgba(255, 255, 255, 0.07);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    border-radius: 10px;
                    padding: 8px 12px;
                    outline: none;
                    transition: all 0.2s;
                }

                .nav-btn:focus { border-color: rgba(255,255,255,0.4); }

                @media (max-width: 992px) {
                    .dashboard-grid-main { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .address-grid { grid-template-columns: 1fr; }
                    .address-grid-row {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                }

                .italic { font-style: italic; }
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); }
            `}</style>
        </div>
    );
};

export default ProviderDashboard;