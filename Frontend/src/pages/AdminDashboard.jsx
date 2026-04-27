import { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form állapotok
    const [adminData, setAdminData] = useState({ name: '', email: '', phone: '', password: '' });
    const [serviceData, setServiceData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/pending');
            setPendingUsers(res.data);
        } catch (err) { 
            console.error(err); 
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/admin/approve/${id}`);
            alert("Sikeres jóváhagyás!");
            fetchPending();
        } catch (err) { alert("Hiba a jóváhagyás során!"); }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create-admin', adminData);
            alert("Új admin sikeresen létrehozva!");
            setAdminData({ name: '', email: '', phone: '', password: '' });
        } catch (err) { alert(err.response?.data?.message || "Hiba történt"); }
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create-service', serviceData);
            alert("Új szolgáltatás hozzáadva!");
            setServiceData({ name: '', description: '' });
        } catch (err) { alert(err.response?.data?.message || "Hiba történt"); }
    };

    if (loading && pendingUsers.length === 0) return <div className="text-center mt-5 text-white">Betöltés...</div>;

    return (
        <div className="container py-4 animate-fade-in">
            <h2 className="mb-4 text-white fw-bold">Adminisztrációs Vezérlőpult</h2>

            <div className="dashboard-grid-main">

                {/* BAL OSZLOP: Kezelőpanelek */}
                <div className="d-flex flex-column gap-4">

                    {/* 1. ÚJ ADMIN LÉTREHOZÁSA */}
                    <div className="card glass-panel p-4">
                        <h4 className="fw-bold mb-4 border-bottom pb-2">Új Adminisztrátor</h4>
                        <form onSubmit={handleCreateAdmin} className="d-flex flex-column gap-3">
                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Teljes név</label>
                                <input 
                                    type="text" className="nav-btn w-100" 
                                    value={adminData.name} onChange={e => setAdminData({...adminData, name: e.target.value})} required 
                                />
                            </div>
                            
                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">E-mail cím</label>
                                <input 
                                    type="email" className="nav-btn w-100" 
                                    value={adminData.email} onChange={e => setAdminData({...adminData, email: e.target.value})} required 
                                />
                            </div>

                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Telefonszám</label>
                                <input 
                                    type="text" className="nav-btn w-100" 
                                    value={adminData.phone} onChange={e => setAdminData({...adminData, phone: e.target.value})} required 
                                />
                            </div>

                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Jelszó</label>
                                <input 
                                    type="password" className="nav-btn w-100" 
                                    value={adminData.password} onChange={e => setAdminData({...adminData, password: e.target.value})} required 
                                />
                            </div>

                            <button
                                type="submit"
                                className="nav-btn nav-btn-highlight py-2 fw-bold shadow-sm mt-5"
                                style={{ marginTop: '40px' }}
                            >
                                Admin mentése
                            </button>
                        </form>
                    </div>

                    {/* 2. ÚJ SZOLGÁLTATÁS (SZAKMA) */}
                    <div className="card glass-panel p-4">
                        <h4 className="fw-bold mb-4 border-bottom pb-2 text-info">🛠️ Új szakma felvétele</h4>
                        <form onSubmit={handleCreateService} className="d-flex flex-column gap-3">
                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Szolgáltatás neve</label>
                                <input 
                                    type="text" placeholder="pl. Fodrász, Kozmetikus" className="nav-btn w-100" 
                                    value={serviceData.name} onChange={e => setServiceData({...serviceData, name: e.target.value})} required 
                                />
                            </div>

                            <div className="form-group-custom">
                                <label className="mb-1 fw-bold opacity-75 small">Rövid leírás</label>
                                <textarea 
                                    className="nav-btn w-100" style={{ height: '100px', resize: 'none' }}
                                    value={serviceData.description} onChange={e => setServiceData({...serviceData, description: e.target.value})} required 
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="nav-btn py-2 fw-bold mt-5" 
                                style={{ background: 'var(--primary-blue)', border: 'none', marginTop: '40px' }}
                            >
                                Szakma rögzítése
                            </button>
                        </form>
                    </div>
                </div>

                {/* JOBB OSZLOP: Jóváhagyásra váró felhasználók */}
                <div className="card glass-panel p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                        <h4 className="fw-bold m-0 text-warning">
                            <i className="bi bi-shield-lock me-2"></i>Jóváhagyási lista
                        </h4>
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3">
                            {pendingUsers.length} db
                        </span>
                    </div>

                    <div className="d-flex flex-column gap-5">
                        {pendingUsers.length > 0 ? (
                            [...pendingUsers].reverse().map((u, i) => (
                                <div key={i} className="review-card-modern shadow-lg">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="review-avatar-mini me-3">
                                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <div className="small fw-bold text-white leading-tight">
                                                    {u.name}
                                                </div>
                                                <div className="text-muted small">
                                                    {u.email}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleApprove(u.id)}
                                            className="nav-btn nav-btn-highlight btn-sm px-3 py-1"
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            JÓVÁHAGYÁS
                                        </button>
                                    </div>
                                    
                                    <div className="review-body">
                                        <p className="small m-0 text-white-50 italic">
                                            A felhasználó regisztrációja függőben van. A jóváhagyás után teljes hozzáférést kap a rendszerhez.
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5 glass-card-simple rounded-4">
                                <i className="bi bi-person-check fs-1 d-block mb-2 opacity-20"></i>
                                <p className="small m-0 opacity-50">Nincs jóváhagyásra váró regisztráció.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-grid-main {
                    display: grid;
                    grid-template-columns: 1fr 1fr; /* Egyenlő elosztás az adminnál */
                    gap: 1.5rem;
                    align-items: start;
                }

                .glass-panel {
                    background: var(--glass-bg);
                    backdrop-filter: blur(15px);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    color: white;
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

                .nav-btn {
                    background: rgba(255, 255, 255, 0.07);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    border-radius: 10px;
                    padding: 8px 12px;
                    outline: none;
                    transition: all 0.2s;
                }

                .review-card-modern {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 24px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .review-card-modern:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--accent-blue);
                    transform: translateY(-8px);
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
                    font-weight: bold;
                }

                .review-body {
                    margin-top: 15px;
                    padding-left: 18px;
                    border-left: 3px solid var(--accent-blue);
                }

                @media (max-width: 992px) {
                    .dashboard-grid-main { grid-template-columns: 1fr; }
                }

                .italic { font-style: italic; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;