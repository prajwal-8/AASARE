import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [role, setRole] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [document, setDocument] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, {
                name,
                username,
                password,
                email,
                phone,
                dob,
                role,
                specialization: role === 'consultant' ? specialization : undefined
            });
            setMessage(response.data.message);
            navigate('/login');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className='registerbody'>
            <div className="register-container">
                <div className="register-form-container">
                    <h2 className="register-title">Register</h2>
                    <form className="register-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            className="register-input"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            name="username"
                            className="register-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            className="register-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            className="register-input"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            name="phone"
                            className="register-input"
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <input
                            type="date"
                            name="dob"
                            className="register-input"
                            placeholder="Date of Birth"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            required
                        />
                        <select
                            name="role"
                            className="register-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="customer">Customer</option>
                            <option value="consultant">Consultant</option>
                        </select>
                        {role === 'consultant' && (
                            <>
                                <input
                                    type="text"
                                    name="specialization"
                                    className="register-input"
                                    placeholder="Specialization"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    name="document"
                                    className="register-input"
                                    placeholder="Document Link"
                                    value={document}
                                    onChange={(e) => setDocument(e.target.value)}
                                    required
                                />
                            </>
                        )}
                        <button type="submit" className="register-button">Register</button>
                    </form>
                    <div className="redir">
                        Already exist <br></br>
                        <a href="/login"><button className="register-button">Login</button></a>
                    </div>
                    {message && <p className="register-message">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default Register;
