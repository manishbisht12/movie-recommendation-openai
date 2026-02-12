import React, { useState } from 'react';
import RecommendationForm from '../components/RecommendationForm';
import MovieGrid from '../components/MovieGrid';

const Home = () => {
    const [userInput, setUserInput] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getRecommendations = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setLoading(true);
        setError('');
        setRecommendations([]);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput }),
            });

            const data = await response.json();
            if (response.ok) {
                setRecommendations(data.recommendedMovies);
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const clearRecommendations = () => {
        setRecommendations([]);
        setError('');
    };

    const removeIndividualMovie = (indexToRemove) => {
        setRecommendations(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="container">
            <h1>CineSuggest AI</h1>

            <RecommendationForm
                userInput={userInput}
                setUserInput={setUserInput}
                onSubmit={getRecommendations}
                loading={loading}
                error={error}
            />

            {recommendations.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={clearRecommendations}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            padding: '0.5rem 1.5rem',
                            fontSize: '0.9rem',
                            boxShadow: 'none'
                        }}
                    >
                        Clear All Results
                    </button>
                </div>
            )}

            <MovieGrid
                recommendations={recommendations}
                onRemove={removeIndividualMovie}
            />
        </div>
    );
};

export default Home;
