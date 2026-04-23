import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ReviewForm = () => {
    // Az URL-ből vesszük ki az ID-kat: /add-review/12/5
    const { providerId, serviceId } = useParams(); 
    const navigate = useNavigate();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Ellenőrizzük konzolon, hogy megvannak-e az ID-k
        console.log("Küldés:", { providerId, serviceId, rating, comment });

        if (!providerId || !serviceId) {
            alert("Hiányzó szolgáltató vagy szolgáltatás azonosító!");
            return;
        }

        setLoading(true);
        try {
            // FONTOS: A neveket pontosan úgy kell küldeni, ahogy a backend várja (camelCase)
            await api.post('/reviews/add', {
                providerId: Number(providerId), // Számmá alakítás
                serviceId: Number(serviceId),   // Számmá alakítás
                rating: Number(rating),
                comment: comment
            });
            
            alert('Értékelés sikeresen elküldve!');
            navigate('/my-bookings');
        } catch (err) {
            console.error("Backend hiba:", err.response?.data);
            alert('Hiba: ' + (err.response?.data?.message || 'Sikertelen értékelés'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 card p-4 shadow border-primary bg-white">
                    <h3 className="text-center mb-4 text-primary">Szolgáltatás értékelése</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Hány csillagot adsz?</label>
                            <select 
                                className="form-select border-primary" 
                                value={rating} 
                                onChange={e => setRating(e.target.value)}
                            >
                                <option value="5">⭐⭐⭐⭐⭐ (5 - Kiváló)</option>
                                <option value="4">⭐⭐⭐⭐ (4 - Jó)</option>
                                <option value="3">⭐⭐⭐ (3 - Átlagos)</option>
                                <option value="2">⭐⭐ (2 - Gyenge)</option>
                                <option value="1">⭐ (1 - Elfogadhatatlan)</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Véleményed:</label>
                            <textarea 
                                className="form-control border-primary" 
                                rows="4" 
                                value={comment} 
                                onChange={e => setComment(e.target.value)}
                                placeholder="Opcionális: Írd le a tapasztalataidat..."
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 shadow fw-bold" disabled={loading}>
                            {loading ? 'Küldés...' : 'Értékelés beküldése'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewForm;