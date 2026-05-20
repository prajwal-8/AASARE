import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/badges.css'; // Adjusted import path

const Badges = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBadges = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/badges`, { withCredentials: true });
            setBadges(res.data);
        } catch (error) {
            console.error('Error fetching badges', error);
            setError('Failed to fetch badges');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, []);

    if (loading) return <p className="badge-loading">Loading...</p>;
    if (error) return <p className="badge-error">Error: {error}</p>;

    return (
        <div className='badgebody'>
            <h2 className="badge-title">Your Badges !!</h2>
            <ul className="badge-list">
                {badges.map((badge, index) => (
                    <h1>
                        You are <li key={index} className="badge-item">{badge}</li>
                    </h1>
                    
                ))}
            </ul>
        </div>
    );
};

export default Badges;
