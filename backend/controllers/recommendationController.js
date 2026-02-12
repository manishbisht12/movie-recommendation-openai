import { VertexAI } from '@google-cloud/vertexai';
import MovieRecommendation from "../models/Recommendation.js";

// Render par Secret File ka path fix hota hai
const KEY_PATH = '/etc/secrets/google-credentials.json';

// Vertex AI setup (Location force karne se error khatam ho jayega)
const vertexAI = new VertexAI({
    project: 'gen-lang-client-0809119989',
    location: 'us-central1', // US region force kiya hai
    keyFilename: KEY_PATH
});

export const getRecommendations = async (req, res) => {
    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
    }

    try {
        // Vertex AI model initialize
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });

        const prompt = `You are a movie recommendation expert. Based on the user's preference: "${userInput}", suggest 3 to 5 relevant movies. 
        Provide only the titles of the movies in a comma-separated list. No other text.`;

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        console.log("📡 Requesting recommendations via Vertex AI for:", userInput);

        const result = await model.generateContent(request);
        const response = await result.response;

        // Vertex AI ka response candidates array se nikalte hain
        const responseText = response.candidates[0].content.parts[0].text;

        console.log("✅ Vertex AI Response:", responseText);

        // Cleaning logic
        const cleanedText = responseText.replace(/```/g, '').replace(/csv/g, '').trim();
        const recommendedMovies = cleanedText
            .split(/,|\n/)
            .map(movie => movie.replace(/^\d+\.\s*/, '').trim())
            .filter(movie => movie.length > 0)
            .slice(0, 5);

        // MongoDB mein save karein
        const newRecommendation = new MovieRecommendation({
            userInput,
            recommendedMovies,
        });
        await newRecommendation.save();

        res.json({ recommendedMovies });

    } catch (error) {
        console.error("❌ Vertex AI Error:", error);
        res.status(500).json({
            error: "Failed to generate recommendations",
            details: error.message
        });
    }
};