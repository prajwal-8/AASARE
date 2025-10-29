// frontend/src/components/Exercise.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../css/exercise.css';

const Exercises = () => {
    const { auth } = useAuth();
    const [exercises, setExercises] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [exerciseProgress, setExerciseProgress] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/exercises`, { withCredentials: true });
                setExercises(response.data);
            } catch (error) {
                console.error('Error fetching exercises', error);
            }
        };

        const fetchExerciseProgress = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/exercises/progress`, { withCredentials: true });
                setExerciseProgress(response.data);
            } catch (error) {
                console.error('Error fetching exercise progress', error);
            }
        };
        fetchExerciseProgress();
        fetchExercises();
    }, []);

    const handleAddExercise = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/exercises`, {
                title,
                description,
                created_by : auth.username
            }, { withCredentials: true });
            setExercises([...exercises, response.data]);
            setTitle('');
            setDescription('');
            setMessage('Exercise added successfully!');
        } catch (error) {
            setMessage('Error adding exercise');
            console.error('Error adding exercise', error);
        }
    };

    const handleCompleteExercise = async (exerciseId) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/exercises/${exerciseId}/complete`, {}, { withCredentials: true });
            setMessage('Exercise completed successfully!');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/exercises/progress`, { withCredentials: true });
            setExerciseProgress(response.data);
        } catch (error) {
            setMessage('Error completing exercise');
            console.error('Error completing exercise', error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/logout`, {}, { withCredentials: true });
            window.location.href = '/';
        } catch (error) {
            console.error('Error logging out', error);
        }
    }

    return (
        <div className='exebody'>

        <div className="exercise-container">
            <h2 className="exercise-title">Exercises</h2>
            { auth.role === 'consultant' && (
                <div className="add-exercise-section">
                    <h3 className="add-exercise-title">Add New Exercise</h3>
                    <form className="add-exercise-form" onSubmit={handleAddExercise}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                        <button type="submit">Add Exercise</button>
                    </form>
                    {message && <p className="exercise-message">{message}</p>}
                </div>
            )}
            <div className="all-exercises-section">
                <h3 className="all-exercises-title">All Exercises</h3>
                <ul className="exercise-list">
                    {exercises.map((exercise) => (
                        <li className="exercise-item" key={exercise._id}>
                            <h3 className="exercise-item-title">{exercise.title}</h3>
                            <p className="exercise-item-description">{exercise.description}</p>
                            <button className="complete-exercise-button" onClick={() => handleCompleteExercise(exercise._id)}>Complete Exercise</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="exercise-progress-section">
                <h3 className="exercise-progress-title">Exercise Progress</h3>
                <ul className="exercise-progress-list">
                    {exerciseProgress.length > 0 ? (
                        exerciseProgress.map((exercise) => (
                            <li className="exercise-progress-item" key={exercise.exercise_id}>
                                Exercise Name: {exercise.title} - Times Completed: {exercise.timesCompleted}
                            </li>
                        ))
                    ) : (
                        <p className="no-progress-message">No exercise progress to display.</p>
                    )}
                </ul>
            </div>
            {/* <button className="logout-button" onClick={handleLogout}>Logout</button> */}
            <a href="/dashboard"><button className="button-56">Dashboard</button></a> 
        </div>
        </div>
    );
};

export default Exercises;
