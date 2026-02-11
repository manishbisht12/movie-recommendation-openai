import React from 'react';

const RecommendationForm = ({ userInput, setUserInput, onSubmit, loading, error }) => {
    return (
        <div className="glass-card">
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                Enter a genre or your current mood to get the best movie picks for you.
            </p>

            <form onSubmit={onSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Enter movie genre or mood here..."
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', margin: '0 auto' }}>
                    {loading ? (
                        <>
                            <div className="spinner"></div>
                            <span>Finding Gems...</span>
                        </>
                    ) : (
                        'Get Recommendations'
                    )}
                </button>
            </form>

            {error && (
                <p style={{ color: '#ef4444', marginTop: '1.5rem', fontWeight: '500' }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default RecommendationForm;
