import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../css/dashboard.css'; // Import the CSS file

const Dashboard = () => {
    const { auth } = useAuth();
    const [message, setMessage] = useState('');
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard`, { withCredentials: true });
                setMessage(response.data.message);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchDashboard();
    }, [navigate]);

    const handleLogout = async () => {
        await axios.post(`${process.env.REACT_APP_API_URL}/logout`, {}, { withCredentials: true });
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <header>
                <div className="container">
                    <nav className="navb">
                        <ul className="navul">
                            <li><a href="/podcast">Podcast</a></li>
                            <li><a href="/blogs">Blogs</a></li>
                            <li><a href="/exercises">Exercises</a></li>
                            <li><a href="/consultants">Consultancy</a></li>
                            <li><a href="/badges">Badges</a></li>
                        </ul>
                    </nav>
                    <div className="navb-right">
                        <span>Hello,  { auth.username } </span>
                        <a href="/profile" className="profile-link">Profile</a>
                        <button className="button-35" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </header>
            <div className="background-content">
                <div className="text-container">
                    <h1>We are HERE</h1>
                    <h2 className='h2text-container'>to HELP YOU</h2> 
                    <a href="/chatbot"><button class="button-56" role="button">Chat Mitra</button></a>
                    {/* <button className="chatbot-button">Chatbot</button> */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
