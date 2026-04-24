import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        isProvider: false,
        service_id: ''
    });

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services'); 
                setServices(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Hiba a szakmák betöltésekor:", err);
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                service_id: formData.isProvider ? parseInt(formData.service_id) : null
            };
            await api.post('/auth/register', dataToSend);
            alert('Sikeres regisztráció! A fiókod jóváhagyásra vár.');
            navigate('/login');
        } catch (err) {
            alert('Hiba: ' + (err.response?.data?.message || 'Sikertelen regisztráció'));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Design konstansok a konzisztencia miatt
    const labelWidth = '120px';
    const inputBg = 'rgba(255,255,255,0.1)';

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh', padding: '40px 0' }}>
            <div className="col-md-10 col-lg-8 glass-panel shadow-lg animate-fade-in px-4 px-md-5 py-5">
                
                <div className="text-center mb-5">
                    <h2 className="display-5 fw-bold" style={{ color: 'var(--white)' }}>
                        Csatlakozz <span style={{ color: 'var(--accent-blue)' }}>hozzánk!</span>
                    </h2>
                    <p className="text-muted">Hozd létre saját fiókodat egyszerűen.</p>
                </div>

                <form onSubmit={handleRegister} className="d-flex flex-column align-items-center w-100 mx-auto">
                    <div style={{ width: '100%', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                        
                        {/* Név sor */}
                        <div style={{ display: 'grid', gridTemplateColumns: `${labelWidth} 1fr`, alignItems: 'center', marginBottom: '1.2rem' }}>
                            <label className="text-light small fw-bold m-0 text-start">Teljes név</label>
                            <input 
                                type="text" 
                                name="name"
                                placeholder="Kovács János" 
                                className="nav-btn w-100 text-start py-3 px-4" 
                                style={{ background: inputBg, border: '1px solid var(--glass-border)' }}
                                value={formData.name}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        {/* E-mail sor */}
                        <div style={{ display: 'grid', gridTemplateColumns: `${labelWidth} 1fr`, alignItems: 'center', marginBottom: '1.2rem' }}>
                            <label className="text-light small fw-bold m-0 text-start">E-mail</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="pelda@email.hu" 
                                className="nav-btn w-100 text-start py-3 px-4" 
                                style={{ background: inputBg, border: '1px solid var(--glass-border)' }}
                                value={formData.email}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        {/* Telefon sor */}
                        <div style={{ display: 'grid', gridTemplateColumns: `${labelWidth} 1fr`, alignItems: 'center', marginBottom: '1.2rem' }}>
                            <label className="text-light small fw-bold m-0 text-start">Telefonszám</label>
                            <input 
                                type="text" 
                                name="phone"
                                placeholder="+36 30 123 4567" 
                                className="nav-btn w-100 text-start py-3 px-4" 
                                style={{ background: inputBg, border: '1px solid var(--glass-border)' }}
                                value={formData.phone}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        {/* Jelszó sor - Szöveges MUTAT/ELREJT gombbal */}
                        <div style={{ display: 'grid', gridTemplateColumns: `${labelWidth} 1fr`, alignItems: 'center', marginBottom: '1.5rem' }}>
                            <label className="text-light small fw-bold m-0 text-start">Jelszó</label>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                background: inputBg, 
                                border: '1px solid var(--glass-border)',
                                borderRadius: '50px',
                                overflow: 'hidden'
                            }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    placeholder="••••••••" 
                                    className="nav-btn border-0 w-100 py-3 ps-4" 
                                    style={{ background: 'transparent', outline: 'none', boxShadow: 'none' }}
                                    value={formData.password}
                                    onChange={handleChange}
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

                        {/* Szolgaltato kapcsolo sor */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '100px 1fr', 
                            alignItems: 'center', 
                            marginBottom: '1.2rem' 
                        }}>
                            <div></div> {/* Üres hely a label oszlopban */}
                            
                            <div className="d-flex align-items-center justify-content-start" style={{ gap: '15px' }}>
                                <label 
                                    className="text-light small fw-bold" 
                                    htmlFor="providerCheck" 
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                    Szolgáltatóként regisztrálok
                                </label>
                                
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    name="isProvider"
                                    id="providerCheck" 
                                    checked={formData.isProvider}
                                    onChange={handleChange} 
                                    style={{ 
                                        cursor: 'pointer',
                                        width: '1.5rem',   /* Nagyobb szélesség */
                                        height: '1.5rem',  /* Nagyobb magasság */
                                        marginTop: '0',     /* Bootstrap korrekció az igazításhoz */
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderColor: 'var(--glass-border)'
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Szakma választó - Csak ha szolgáltató */}
                        {formData.isProvider && (
                            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: `${labelWidth} 1fr`, alignItems: 'center', marginBottom: '1.5rem' }}>
                                <label className="text-light small fw-bold m-0 text-start">Szakma</label>
                                <select 
                                    name="service_id"
                                    className="nav-btn w-100 text-start py-3 px-4" 
                                    style={{ background: inputBg, border: '1px solid var(--glass-border)', color: 'white', appearance: 'auto' }}
                                    value={formData.service_id} 
                                    onChange={handleChange}
                                    required={formData.isProvider}
                                >
                                    <option value="" style={{background: '#2c3e50'}}>-- Válassz szakmát --</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id} style={{background: '#2c3e50'}}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Regisztráció Gomb */}
                        <div style={{ display: 'grid', gridTemplateColumns: `${labelWidth} 1fr`, alignItems: 'center' }}>
                            <div></div>
                            <div className="d-flex justify-content-center w-100"> 
                                <button 
                                    type="submit" 
                                    className="nav-btn nav-btn-highlight py-3 fs-5"
                                    style={{ 
                                        minWidth: '220px',
                                        maxWidth: '320px',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingLeft: '0',
                                        paddingRight: '0'
                                    }}
                                >
                                    <span style={{width: '100%', textAlign: 'center'}}>Regisztráció</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Alsó link */}
                    <div className="mt-5 pt-3 text-center border-top w-100" style={{ borderColor: 'var(--glass-border)', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                        <p className="small text-light m-0">
                            Van már fiókod?{' '}
                            <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
                                Jelentkezz be itt
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;