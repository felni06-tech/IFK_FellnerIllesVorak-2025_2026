import { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [view, setView] = useState('pending'); // 'pending', 'newAdmin', 'newService'
    const [pendingUsers, setPendingUsers] = useState([]);
    
    // Form állapotok
    const [adminData, setAdminData] = useState({ name: '', email: '', phone: '', password: '' });
    const [serviceData, setServiceData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (view === 'pending') fetchPending();
    }, [view]);

    const fetchPending = async () => {
        try {
            const res = await api.get('/admin/pending');
            setPendingUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/admin/approve/${id}`);
            alert("Jóváhagyva!");
            fetchPending();
        } catch (err) { alert("Hiba!"); }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create-admin', adminData);
            alert("Új admin létrehozva!");
            setAdminData({ name: '', email: '', phone: '', password: '' });
        } catch (err) { alert(err.response?.data?.message || "Hiba"); }
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create-service', serviceData);
            alert("Új szolgáltatás hozzáadva!");
            setServiceData({ name: '', description: '' });
        } catch (err) { alert(err.response?.data?.message || "Hiba"); }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-danger">Adminisztrációs Panel</h2>
                <div className="btn-group shadow-sm">
                    <button className={`btn ${view === 'pending' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setView('pending')}>Várólista</button>
                    <button className={`btn ${view === 'newAdmin' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setView('newAdmin')}>Admin felvétel</button>
                    <button className={`btn ${view === 'newService' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setView('newService')}>Új szakma</button>
                </div>
            </div>

            <hr />

            {/* 1. JÓVÁHAGYÁSOK */}
            {view === 'pending' && (
                <div>
                    <h4>Jóváhagyásra váró felhasználók</h4>
                    {pendingUsers.length === 0 ? <p className="mt-3">Nincs függőben lévő regisztráció.</p> : (
                        <table className="table table-hover mt-3 shadow-sm border">
                            <thead className="table-dark">
                                <tr><th>Név</th><th>Email</th><th>Művelet</th></tr>
                            </thead>
                            <tbody>
                                {pendingUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td><td>{u.email}</td>
                                        <td><button className="btn btn-success btn-sm" onClick={() => handleApprove(u.id)}>Jóváhagyás</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* 2. ÚJ ADMIN LÉTREHOZÁSA */}
            {view === 'newAdmin' && (
                <div className="col-md-6 offset-md-3 card p-4 shadow">
                    <h4>Új Adminisztrátor regisztrálása</h4>
                    <form onSubmit={handleCreateAdmin} className="mt-3">
                        <input type="text" placeholder="Név" className="form-control mb-2" value={adminData.name} onChange={e => setAdminData({...adminData, name: e.target.value})} required />
                        <input type="email" placeholder="Email" className="form-control mb-2" value={adminData.email} onChange={e => setAdminData({...adminData, email: e.target.value})} required />
                        <input type="text" placeholder="Telefon" className="form-control mb-2" value={adminData.phone} onChange={e => setAdminData({...adminData, phone: e.target.value})} required />
                        <input type="password" placeholder="Jelszó" className="form-control mb-3" value={adminData.password} onChange={e => setAdminData({...adminData, password: e.target.value})} required />
                        <button type="submit" className="btn btn-primary w-100">Admin mentése</button>
                    </form>
                </div>
            )}

            {/* 3. ÚJ SZOLGÁLTATÁS LÉTREHOZÁSA */}
            {view === 'newService' && (
                <div className="col-md-6 offset-md-3 card p-4 shadow">
                    <h4>Új szakma / szolgáltatás felvétele</h4>
                    <form onSubmit={handleCreateService} className="mt-3">
                        <input type="text" placeholder="Szolgáltatás neve (pl. Fodrász)" className="form-control mb-2" value={serviceData.name} onChange={e => setServiceData({...serviceData, name: e.target.value})} required />
                        <textarea placeholder="Leírás" className="form-control mb-3" rows="3" value={serviceData.description} onChange={e => setServiceData({...serviceData, description: e.target.value})} required />
                        <button type="submit" className="btn btn-warning w-100">Szakma mentése</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;