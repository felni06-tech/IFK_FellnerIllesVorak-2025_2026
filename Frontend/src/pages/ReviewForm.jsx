import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ReviewForm = () => {
    const { providerId, serviceId } = useParams(); 
    const navigate = useNavigate();
    const textAreaRef = useRef(null); // Ref a textarea eléréséhez

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Dinamikus magasság állítás
    const handleTextChange = (e) => {
        setComment(e.target.value);
        
        // Visszaállítjuk az alapmagasságot, majd beállítjuk a görgetési magasságra (scrollHeight)
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!providerId || !serviceId) {
            alert("Hiányzó szolgáltató vagy szolgáltatás azonosító!");
            return;
        }

        setLoading(true);
        try {
            await api.post('/reviews/add', {
                providerId: Number(providerId),
                serviceId: Number(serviceId),
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
        <div className="container d-flex justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
            <div className="col-md-8 col-lg-5 glass-panel shadow-lg animate-fade-in p-5">
                
                <div className="text-center mb-5">
                    <h2 className="display-6 fw-bold text-white">
                        Értékelés <span style={{ color: 'var(--accent-blue)' }}>küldése</span>
                    </h2>
                    <p className="text-muted small">Oszd meg velünk a tapasztalataidat!</p>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    
                    <div className="form-group-custom">
                        <label className="mb-2 fw-bold opacity-75 small text-light">Hány csillagot adsz?</label>
                        <select 
                            className="nav-btn w-100 py-3 px-4" 
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer'
                            }}
                            value={rating} 
                            onChange={e => setRating(e.target.value)}
                        >
                            <option value="5" className="bg-dark">⭐⭐⭐⭐⭐ (5 - Kiváló)</option>
                            <option value="4" className="bg-dark">⭐⭐⭐⭐ (4 - Jó)</option>
                            <option value="3" className="bg-dark">⭐⭐⭐ (3 - Átlagos)</option>
                            <option value="2" className="bg-dark">⭐⭐ (2 - Gyenge)</option>
                            <option value="1" className="bg-dark">⭐ (1 - Elfogadhatatlan)</option>
                        </select>
                    </div>

                    <div className="form-group-custom">
                        <label className="mb-2 fw-bold opacity-75 small text-light">Véleményed</label>
                        <textarea 
                            ref={textAreaRef}
                            className="nav-btn w-100 py-3 px-4 auto-expand" 
                            rows="3" 
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid var(--glass-border)',
                                resize: 'none',
                                borderRadius: '20px',
                                overflow: 'hidden', // Itt tiltjuk le a scrollbart
                                minHeight: '120px',
                                transition: 'height 0.2s ease-out'
                            }}
                            value={comment} 
                            onChange={handleTextChange}
                            placeholder="Írd le pár szóban, hogy elégedett voltál-e..."
                        ></textarea>
                    </div>

                    <div className="text-center mt-3">
                        <button 
                            type="submit" 
                            className="nav-btn nav-btn-highlight w-100 py-3 fs-5 shadow-sm"
                            style={{ marginTop: '20px' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <span><span className="spinner-border spinner-border-sm me-2"></span>Küldés...</span>
                            ) : (
                                'Értékelés beküldése'
                            )}
                        </button>
                    </div>
                </form>
                
                <div className="mt-4 text-center">
                    <button 
                        onClick={() => navigate('/my-bookings')} 
                        className="btn btn-link text-muted text-decoration-none small opacity-50 hover-opacity-100"
                    >
                        Inkább mégse értékelek
                    </button>
                </div>
            </div>

            <style>{`
                .glass-panel {
                    background: var(--glass-bg);
                    backdrop-filter: blur(15px);
                    border: 1px solid var(--glass-border);
                    border-radius: 30px;
                }

                .hover-opacity-100:hover {
                    opacity: 1 !important;
                    color: white !important;
                }

                select option {
                    background-color: #1a1a1a;
                    color: white;
                }

                /* Finom átmenet a magasság változáshoz */
                .auto-expand {
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                }
            `}</style>
        </div>
    );
};

export default ReviewForm;