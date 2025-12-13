import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../css/Blogs.css'; // Make sure to import the CSS filee
import memoji from '../assets/images/memoji.jpeg'; // Import the imagee

const Blogs = () => {
    const { auth } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [tag, setTag] = useState('');
    const [expandedBlogs, setExpandedBlogs] = useState({});

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/blogs`, { withCredentials: true });
                setBlogs(response.data);
            } catch (error) {
                console.error('Error fetching blogs', error);
            }
        };

        fetchBlogs();
    }, []);

    const handleAddBlog = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/blogs`, {
                title,
                content,
                tag
            }, { withCredentials: true });
            setBlogs([...blogs, response.data]);
            setTitle('');
            setContent('');
            setMessage('Blog added successfully!');
        } catch (error) {
            setMessage('Error adding blog');
            console.error('Error adding blog', error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/logout`, {}, { withCredentials: true });
            window.location.href = '/';
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    const toggleReadMore = (blogId) => {
        setExpandedBlogs((prevState) => ({
            ...prevState,
            [blogId]: !prevState[blogId]
        }));
    };

    return (
        <div className='blogbody'>
            <div className="containerblog">
                <h2 className='h2blogs'>BLOGS</h2>
                {auth.role === 'consultant' && (
                    <div className="add-blog">
                        <h3 className='h3blogs'>Add New Blog</h3>
                        <form onSubmit={handleAddBlog}>
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            ></textarea>
                            <input
                                type="text"
                                placeholder="tag"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                required
                            />
                            <button type="submit">Add Blog</button>
                        </form>
                        {message && <p>{message}</p>}
                    </div>
                )}
                <h3 className='h3blogs1'>All Blogs</h3>
                <div className="blogs-container">
                    {blogs.map((blog) => (
                        <div className="card" key={blog._id}>
                            <div className="card__body">
                                <span className={`tag tag-${blog.category}`}>{blog.category}</span>
                                <h4>{blog.title}</h4>
                                <p>
                                    {expandedBlogs[blog._id] ? blog.content : `${blog.content.substring(0, 100)}...`}
                                    <button className="read-more" onClick={() => toggleReadMore(blog._id)}>
                                        {expandedBlogs[blog._id] ? 'Read Less' : 'Read More'}
                                    </button>
                                </p>
                                <h2>{blog.tag}</h2>
                            </div>
                            <div className="card__footer">
                                <div className="user">
                                    <img src={memoji} alt="user__image" className="user__image" />
                                    <div className="user__info">
                                        <h4>{blog.author}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="logout-button-container">
                    {/* <button className="logout-button" onClick={handleLogout}>Logout</button> */}
                    <a href="/dashboard"><button className="button-56">Dashboard</button></a> 
                </div>
            </div>
        </div>
    );
};

export default Blogs;
