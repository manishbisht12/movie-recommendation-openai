import React from 'react';

const MovieCard = ({ title, delay, onRemove }) => {
    return (
        <div
            className="movie-card"
            style={{ animationDelay: `${delay}s`, position: 'relative' }}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="remove-btn"
                title="Remove this recommendation"
            >
                ×
            </button>
            <h3>{title}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Recommended for you
            </p>
        </div>
    );
};

export default MovieCard;
