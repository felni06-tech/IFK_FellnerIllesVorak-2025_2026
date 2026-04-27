import { useState } from 'react';
import api from '../api/axios';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/admin/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('admin', JSON.stringify(res.data.admin));
            window.location.href = '/admin/dashboard';
        } catch (err) {
            alert('Hiba: ' + (err.response?.data?.message || 'Sikertelen admin belépés'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="col-md-10 col-lg-7 glass-panel shadow-lg animate-fade-in px-5">
                <div className="text-center mb-5">
                    <h2 className="display-5 fw-bold" style={{ color: 'var(--white)' }}>
                        Admin <span style={{ color: 'var(--accent-blue)' }}>Portál</span>
                    </h2>
                    <p className="text-muted">Kérjük, azonosítsa magát a folytatáshoz.</p>
                </div>

                <form onSubmit={handleLogin} className="d-flex flex-column align-items-center w-100 mx-auto">
                    <div style={{ width: '100%', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
                        
                        {/* E-mail sor */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '100px 1fr', 
                            alignItems: 'center', 
                            marginBottom: '1.5rem' 
                        }}>
                            <label className="text-light small fw-bold m-0 text-start">Email</label>
                            <input 
                                type="email" 
                                placeholder="admin@rendszer.hu" 
                                className="nav-btn w-100 text-start py-3 px-4" 
                                style={{ 
                                    background: 'rgba(255,255,255,0.1)', 
                                    border: '1px solid var(--glass-border)'
                                }}
                                onChange={e => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        {/* Jelszó sor */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '100px 1fr', 
                            alignItems: 'center', 
                            marginBottom: '2rem' 
                        }}>
                            <label className="text-light small fw-bold m-0 text-start">Jelszó</label>
                            
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                background: 'rgba(255,255,255,0.1)', 
                                border: '1px solid var(--glass-border)',
                                borderRadius: '50px',
                                overflow: 'hidden'
                            }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="nav-btn border-0 w-100 py-3 ps-4" 
                                    style={{ 
                                        background: 'transparent', 
                                        outline: 'none',
                                        boxShadow: 'none'
                                    }}
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-blue)',
                                        cursor: 'pointer',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        padding: '0 20px',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    {showPassword ? "ELREJT" : "MUTAT"}
                                </button>
                            </div>
                        </div>

                        {/* Gomb sor */}
                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
                            <div></div>
                            <div className="d-flex justify-content-center w-100"> 
                                <button 
                                    type="submit" 
                                    className="nav-btn nav-btn-highlight py-3 fs-5"
                                    style={{ 
                                        minWidth: '200px',
                                        maxWidth: '280px',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingLeft: '0',
                                        paddingRight: '0'
                                    }}
                                    disabled={loading}
                                >
                                    <span style={{width: '100%', textAlign: 'center'}}>
                                        {loading ? 'Hitelesítés...' : 'Admin Belépés'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-3 text-center border-top w-100" style={{ borderColor: 'var(--glass-border)', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
                        <p className="small text-light m-0 opacity-50 italic">
                            Ez a felület kizárólag adminisztrátorok részére érhető el.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;