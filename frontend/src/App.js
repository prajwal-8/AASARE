import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Blogs from './components/Blogs';
import Chatbot from './components/Chatbot';
import Consultants from './components/Consultants';
import Exercise from './components/Exercise';
import PodcastComponent from './components/Podcast';
import Profile from './components/Profile';
import Badges
 from './components/Badges';
import { AuthProvider, useAuth } from './AuthContext';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/consultants" element={<Consultants />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/exercises" element={<Exercise />} />
                    <Route path="/podcast" element={<PodcastComponent />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/badges" element={<Badges />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;