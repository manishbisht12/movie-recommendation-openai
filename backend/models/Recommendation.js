import mongoose from 'mongoose';

const movieRecommendationSchema = new mongoose.Schema({
    userInput: {
        type: String,
        required: true,
    },
    recommendedMovies: {
        type: [String],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const MovieRecommendation = mongoose.model('MovieRecommendation', movieRecommendationSchema);

export default MovieRecommendation;
