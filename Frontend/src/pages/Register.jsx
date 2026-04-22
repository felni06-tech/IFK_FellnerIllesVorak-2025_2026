import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    // 1. Állapotok (state) definiálása
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        isProvider: false,
        service_id: ''
    });

    const [services, setServices] = useState([]); // Itt tároljuk a backendről jövő szakmákat
    const [loading, setLoading] = useState(true); // Betöltés jelzése
    const navigate = useNavigate();

    // 2. Szakmák lekérése a backendről az oldal betöltésekor
    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Fontos: ellenőrizd a backend útvonalat (pl. /services vagy /api/services)
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

    // 3. Regisztráció beküldése
    const handleRegister = async (e) => {
        e.preventDefault();
        
        try {
            // Adatok előkészítése a backend igényei szerint
            const dataToSend = {
                ...formData,
                // Ha szolgáltató, számmá alakítjuk az ID-t, ha nem, null-t küldünk
                service_id: formData.isProvider ? parseInt(formData.service_id) : null
            };
            
            await api.post('/auth/register', dataToSend);
            alert('Sikeres regisztráció! A fiókod jóváhagyásra vár.');
            navigate('/login');
        } catch (err) {
            alert('Hiba: ' + (err.response?.data?.message || 'Sikertelen regisztráció'));
        }
    };

    // Segédfüggvény az inputok változásának kezeléséhez
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 card p-4 shadow">
                    <h2 className="text-center mb-4">Regisztráció</h2>
                    <form onSubmit={handleRegister}>
                        
                        <div className="mb-2">
                            <label className="form-label">Teljes név</label>
                            <input type="text" name="name" className="form-control" 
                                value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Email cím</label>
                            <input type="email" name="email" className="form-control" 
                                value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Jelszó</label>
                            <input type="password" name="password" className="form-control" 
                                value={formData.password} onChange={handleChange} required />
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Telefonszám</label>
                            <input type="text" name="phone" className="form-control" 
                                value={formData.phone} onChange={handleChange} required />
                        </div>

                        <div className="form-check form-switch my-3">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                name="isProvider"
                                id="providerCheck" 
                                checked={formData.isProvider}
                                onChange={handleChange} 
                            />
                            <label className="form-check-label" htmlFor="providerCheck">
                                Szolgáltatóként regisztrálok
                            </label>
                        </div>

                        {/* Csak akkor jelenik meg, ha a checkbox be van pipálva */}
                        {formData.isProvider && (
                            <div className="mb-3 border p-3 rounded bg-light">
                                <label className="form-label fw-bold">Válassz szakmát:</label>
                                <select 
                                    name="service_id"
                                    className="form-select" 
                                    value={formData.service_id} 
                                    onChange={handleChange}
                                    required={formData.isProvider}
                                >
                                    <option value="">-- Kérlek válassz --</option>
                                    {loading ? (
                                        <option disabled>Szakmák betöltése...</option>
                                    ) : (
                                        services.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {services.length === 0 && !loading && (
                                    <small className="text-danger d-block mt-1">
                                        Nem találhatók szakmák a rendszerben!
                                    </small>
                                )}
                            </div>
                        )}

                        <button type="submit" className="btn btn-success w-100 mt-3 py-2">
                            Regisztráció véglegesítése
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;