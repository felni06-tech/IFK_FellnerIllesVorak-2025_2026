import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user)); 
        window.location.href = '/'; 
    } catch (err) {
        alert('Hibás e-mail vagy jelszó!');
    }
};

    return (
        <div className="container mt-5">
            <h2>Bejelentkezés</h2>
            <form onSubmit={handleLogin} className="col-md-4">
                <input type="email" placeholder="Email" className="form-control mb-2" onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Jelszó" className="form-control mb-2" onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="btn btn-primary">Belépés</button>
            </form>
        </div>
    );
};

export default Login;