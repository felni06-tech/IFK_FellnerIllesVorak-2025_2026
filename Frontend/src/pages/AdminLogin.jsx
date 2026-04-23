import { useState } from 'react';
import api from '../api/axios';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('admin', JSON.stringify(res.data.admin))
            window.location.href = '/admin/dashboard';
        } catch (err) {
            alert('Hiba: ' + (err.response?.data?.message || 'Sikertelen admin belépés'));
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4 card p-4 shadow bg-dark text-white">
                    <h2 className="text-center">Adminisztráció</h2>
                    <form onSubmit={handleLogin} className="mt-3">
                        <input type="email" placeholder="Admin Email" className="form-control mb-2" onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Jelszó" className="form-control mb-3" onChange={e => setPassword(e.target.value)} required />
                        <button type="submit" className="btn btn-danger w-100">Belépés</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;