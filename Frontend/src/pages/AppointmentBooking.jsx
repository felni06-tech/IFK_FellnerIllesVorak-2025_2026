import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AppointmentBooking = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const res = await api.get('/appointments/available');
                setAppointments(res.data.appointments || []);
                setLoading(false);
            } catch (err) {
                console.error("Hiba:", err);
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const groupedData = appointments.reduce((acc, app) => {
        if (!acc[app.service_name]) acc[app.service_name] = {};
        if (!acc[app.service_name][app.provider_name]) {
            acc[app.service_name][app.provider_name] = { appointments: [] };
        }
        acc[app.service_name][app.provider_name].appointments.push(app);
        return acc;
    }, {});

    // Navigáció a foglalási oldalra
    const goToBooking = (providerName, providerData) => {
        navigate(`/book/${providerName.toLowerCase().replace(/\s+/g, '-')}`, { 
            state: { 
                providerName, 
                appointments: providerData.appointments 
            } 
        });
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-info"></div></div>;

    return (
        <div className="container-fluid py-5 px-4" style={{ background: 'var(--dark-bg)', minHeight: '100vh' }}>
            <h2 className="display-6 fw-bold text-white mb-5 ms-2">
                Időpont <span style={{ color: 'var(--accent-blue)' }}>Foglalás</span>
            </h2>

            {Object.keys(groupedData).map(serviceName => (
                <div key={serviceName} className="netflix-row-container mb-5 animate-fade-in">

                    {/* BAL OLDAL: Fix felirat */}
                    <div className="service-label">
                        <h3 className="text-info fs-5 fw-bold text-uppercase m-0">
                            {serviceName}
                        </h3>
                    </div>

                    {/* JOBB OLDAL: A vízszintes sín */}
                    <div className="provider-scroller no-scrollbar">
                        {Object.keys(groupedData[serviceName]).map(providerName => (
                            <div
                                key={providerName}
                                className="provider-card-netflix"
                                onClick={() => goToBooking(providerName, groupedData[serviceName][providerName])}
                            >
                                <div className="p-avatar">
                                    {providerName.charAt(0)}
                                </div>
                                <div className="p-details">
                                    <div className="p-name">{providerName}</div>
                                    <div className="p-meta">{groupedData[serviceName][providerName].appointments.length} szabad hely</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <style>{`
                .netflix-row-container {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    gap: 0;
                }

                .service-label {
                    min-width: 160px;
                    max-width: 160px;
                    border-right: 2px solid var(--accent-blue);
                    padding-right: 20px;
                    text-align: right;
                    flex-shrink: 0;
                }

                .provider-scroller {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    overflow-y: hidden;
                    padding: 15px 20px;
                    flex-grow: 1;
                    scroll-behavior: smooth;
                }

                .provider-card-netflix {
                    flex: 0 0 220px;
                    margin-right: 15px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 15px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                }

                .provider-card-netflix:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: scale(1.08);
                    border-color: var(--accent-blue);
                    z-index: 2;
                }

                .p-avatar {
                    width: 45px;
                    height: 45px;
                    background: rgba(0, 123, 255, 0.25); 
                    border: 1.5px solid var(--accent-blue);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: white;
                    flex-shrink: 0;
                    text-shadow: 0px 0px 5px rgba(0,0,0,0.5);
                }

                .p-name { color: white; font-weight: bold; font-size: 0.9rem; }
                .p-meta { color: cyan; font-size: 0.7rem; font-weight: bold; opacity: 0.8; }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default AppointmentBooking;