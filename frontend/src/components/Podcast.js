import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/podcast.css'; // Adjust the path as per your project structure

const ITEMS_PER_PAGE = 5;

const Podcast = () => {
    const [podcastSeries, setPodcastSeries] = useState([]);
    const [podcastEpisodes, setPodcastEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [displaySeries, setDisplaySeries] = useState(true); // State to toggle between series and episodes

    useEffect(() => {
        const fetchPodcastData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/podcast_series`, { withCredentials: true });
                const { podcastSeries, podcastEpisodes } = response.data.searchForTerm;
                setPodcastSeries(podcastSeries);
                setPodcastEpisodes(podcastEpisodes);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPodcastData();
    }, []);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const paginate = (array, pageNumber) => {
        return array.slice((pageNumber - 1) * ITEMS_PER_PAGE, pageNumber * ITEMS_PER_PAGE);
    };

    const toggleDisplay = () => {
        setDisplaySeries(!displaySeries); // Toggle between series and episodes
    };

    const renderSeries = () => (
        <div className="podcast-section podcast-series-container">
            <h2>Podcast Series</h2>
            {podcastSeries.length > 0 ? (
                <div>
                    {paginate(podcastSeries, currentPage).map(series => (
                        <div key={series.uuid} className="podcast-series-item">
                            <h3>{series.name}</h3>
                            <p>iTunes ID: {series.itunesId}</p>
                            <a href={series.rssUrl} target="_blank" rel="noopener noreferrer">{series.name + " Documentation"}</a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="podcast-no-results">No podcast series found</div>
            )}
        </div>
    );

    const renderEpisodes = () => (
        <div className="podcast-section podcast-episodes-container">
            <h2>Podcast Episodes</h2>
            {podcastEpisodes.length > 0 ? (
                <div>
                    {paginate(podcastEpisodes, currentPage).map(episode => (
                        <div key={episode.uuid} className="podcast-episode-item">
                            <h3>{episode.name}</h3>
                            <audio controls className="podcast-audio-player">
                                <source src={episode.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="podcast-no-results">No podcast episodes found</div>
            )}
        </div>
    );

    const totalItems = displaySeries ? podcastSeries.length : podcastEpisodes.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div className="podcastbody">
            <div className="podcast-container">
                <h1 className="podcast-title">Podcast Series and Episodes</h1>
                <div className="podcast-toggle">
                    <button onClick={toggleDisplay}>
                        {displaySeries ? 'View Episodes' : 'View Series'}
                    </button>
                </div>
                {displaySeries ? renderSeries() : renderEpisodes()}
                <div className="podcast-pagination">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="podcast-pagination">
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`podcast-page-button ${number === currentPage ? 'active' : ''}`}
                >
                    {number}
                </button>
            ))}
        </div>
    );
};

export default Podcast;
