import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../css/profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [editBlogId, setEditBlogId] = useState(null);
    const [blogFormData, setBlogFormData] = useState({});
    const [editExerciseId, setEditExerciseId] = useState(null);
    const [exerciseFormData, setExerciseFormData] = useState({});
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, { withCredentials: true });
                setProfile(response.data);
                setFormData(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        await axios.post(`${process.env.REACT_APP_API_URL}/logout`, {}, { withCredentials: true });
        logout();
        navigate('/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleBlogInputChange = (e) => {
        const { name, value } = e.target;
        setBlogFormData({ ...blogFormData, [name]: value });
    };

    const handleExerciseInputChange = (e) => {
        const { name, value } = e.target;
        setExerciseFormData({ ...exerciseFormData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/profile`, formData, { withCredentials: true });
            setProfile(formData);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleUpdateBlog = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/blogs/${editBlogId}`, blogFormData, { withCredentials: true });
            const updatedBlogs = profile.blogs.map((blog) =>
                blog._id === editBlogId ? { ...blog, ...blogFormData } : blog
            );
            setProfile({ ...profile, blogs: updatedBlogs });
            setEditBlogId(null);
        } catch (error) {
            console.error('Error updating blog:', error);
        }
    };

    const handleEditBlog = (blog) => {
        setEditBlogId(blog._id);
        setBlogFormData(blog);
    };

    const handleUpdateExercise = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/exercises/${editExerciseId}`, exerciseFormData, { withCredentials: true });
            const updatedExercises = profile.exercises.map((exercise) =>
                exercise._id === editExerciseId ? { ...exercise, ...exerciseFormData } : exercise
            );
            setProfile({ ...profile, exercises: updatedExercises });
            setEditExerciseId(null);
        } catch (error) {
            console.error('Error updating exercise:', error);
        }
    };

    const handleEditExercise = (exercise) => {
        setEditExerciseId(exercise._id);
        setExerciseFormData(exercise);
    };

    return (
        <div className='profilebody'>
            <div className="profile-container">
                <div className="profile-header">
                    <h2>Profile</h2>
                </div>
                {profile && (
                    <div>
                        {editMode ? (
                            <form className="profile-edit-form" onSubmit={handleSubmit}>
                                <label>
                                    Email:
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <label>
                                    Phone:
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <label>
                                    Date of Birth:
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob || ''}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                {profile.role === 'consultant' && (
                                    <>
                                        <label>
                                            Specialization:
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={formData.specialization || ''}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                    </>
                                )}
                                <label>
                                    Password:
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password || ''}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <button type="submit">Save</button>
                            </form>
                        ) : (
                            <div className="profile-details">
                                <p>Email: {profile.email}</p>
                                <p>Phone: {profile.phone}</p>
                                <p>Date of Birth: {profile.dob}</p>
                                {profile.role === 'consultant' && (
                                    <>
                                        <p>Specialization: {profile.specialization}</p>
                                        <div className="blogs-section">
                                            <h3>Blogs:</h3>
                                            <ul className="blogs-list">
                                                {profile.blogs.map((blog) => (
                                                    <li className="blog-item" key={blog._id}>
                                                        {editBlogId === blog._id ? (
                                                            <form className="edit-form" onSubmit={handleUpdateBlog}>
                                                                <label>
                                                                    Title:
                                                                    <input
                                                                        type="text"
                                                                        name="title"
                                                                        value={blogFormData.title || ''}
                                                                        onChange={handleBlogInputChange}
                                                                    />
                                                                </label>
                                                                <label>
                                                                    Content:
                                                                    <textarea
                                                                        name="content"
                                                                        value={blogFormData.content || ''}
                                                                        onChange={handleBlogInputChange}
                                                                    />
                                                                </label>
                                                                <button type="submit">Save</button>
                                                            </form>
                                                        ) : (
                                                            <div>
                                                                <h4>{blog.title}</h4>
                                                                <p>{blog.content}</p>
                                                                <button onClick={() => handleEditBlog(blog)}>Edit</button>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="exercises-section">
                                            <h3>Exercises:</h3>
                                            <ul className="exercises-list">
                                                {profile.exercises.map((exercise) => (
                                                    <li className="exercise-item" key={exercise._id}>
                                                        {editExerciseId === exercise._id ? (
                                                            <form className="edit-form" onSubmit={handleUpdateExercise}>
                                                                <label>
                                                                    Title:
                                                                    <input
                                                                        type="text"
                                                                        name="title"
                                                                        value={exerciseFormData.title || ''}
                                                                        onChange={handleExerciseInputChange}
                                                                    />
                                                                </label>
                                                                <label>
                                                                    Description:
                                                                    <textarea
                                                                        name="description"
                                                                        value={exerciseFormData.description || ''}
                                                                        onChange={handleExerciseInputChange}
                                                                    />
                                                                </label>
                                                                <button type="submit">Save</button>
                                                            </form>
                                                        ) : (
                                                            <div>
                                                                <h4>Title: {exercise.title}</h4>
                                                                <p>Description: {exercise.description}</p>
                                                                <button onClick={() => handleEditExercise(exercise)}>Edit</button>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                                <button onClick={() => setEditMode(true)}>Edit</button>
                            </div>
                        )}
                    </div>
                )}
                <a href="/dashboard"><button className='button-56'>Dashboard</button></a> 
                {/* <button className="logout-button" onClick={handleLogout}>Logout</button> */}
            </div>
        </div>
    );
};

export default Profile;
