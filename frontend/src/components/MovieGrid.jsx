import React from 'react';
import MovieCard from './MovieCard';

const MovieGrid = ({ recommendations, onRemove }) => {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div className="movie-grid">
            {recommendations.map((movie, index) => (
                <MovieCard
                    key={index}
                    title={movie}
                    delay={index * 0.1}
                    onRemove={() => onRemove(index)}
                />
            ))}
        </div>
    );
};

export default MovieGrid;
