import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../css/login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
                username,
                password
            }, { withCredentials: true });
            console.log("Login Response:", response.data);
            if (response.status === 200) {
                setMessage('');
                login(response.data.username, response.data.role);
                navigate('/dashboard');
            } else {
                setMessage('Login failed');
            }
        } catch (error) {
            setMessage('Login failed');
            console.error('Error logging in:', error);
        }
    };

    return (
        <div className='loginbody'>

        <div className="login-container">
            
            <div className="login-form-container">
                <h2 className="login-title">Login</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        className="login-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        className="login-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">Login</button>
                </form>
                <div className="redir">
                    If new user  <br></br>
                    <a href='/register'><button className="login-button">Sign Up</button></a>
                </div>
                {message && <p className="login-message">{message}</p>}
            </div>
        </div>
        </div>
    );
};

export default Login;
