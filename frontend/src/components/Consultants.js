import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/consultants.css';

const Consultants = () => {
    const { auth, logout } = useAuth();
    const [consultants, setConsultants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConsultants = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/consultants`, { withCredentials: true });
                setConsultants(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching consultants', error);
            }
        };

        fetchConsultants();
    }, []);

    const handleLogout = async () => {
        await axios.post(`${process.env.REACT_APP_API_URL}/logout`, {}, { withCredentials: true });
        logout();
        navigate('/login');
    };

    return (
        <div className="consultantbody">
            <div className="consultants-container">
                <h2 className="consultants-title">Our Consultants</h2>
                <div className="consultants-list">
                    {consultants.map((consultant) => (
                        <div key={consultant._id} className="consultant-card">
                            <h4 className="consultant-name">{consultant.username}</h4>
                            <p className="consultant-detail">Email: {consultant.email}</p>
                            <p className="consultant-detail">Phone: {consultant.phone}</p>
                            <p className="consultant-detail">Specialization: {consultant.specialization}</p>
                        </div>
                    ))}
                </div>
                {/* <button className="logout-button" onClick={handleLogout}>Logout</button> */}
                <a href="/dashboard"><button className='button-56'>Dashboard</button></a> 
            </div>
        </div>
    );
};

export default Consultants;
