import { VertexAI } from '@google-cloud/vertexai';
import MovieRecommendation from "../models/Recommendation.js";

// 1. Environment variable se JSON ko object mein convert karne ka function
const getGCPCredentials = () => {
    try {
        if (process.env.GCP_SERVICE_ACCOUNT_JSON) {
            return JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);
        }
        return null;
    } catch (error) {
        console.error("❌ GCP JSON Parse Error:", error.message);
        return null;
    }
};

// 2. Vertex AI Initialize (Direct Credentials ke saath)
const vertexAI = new VertexAI({
    project: 'gen-lang-client-0809119989',
    location: 'us-central1',
    googleAuthOptions: {
        credentials: getGCPCredentials() // Ye line sabse zaroori hai
    }
});

export const getRecommendations = async (req, res) => {
    const { userInput } = req.body;
    if (!userInput) return res.status(400).json({ error: "Input required" });

    try {
        const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Suggest 3-5 movies for: "${userInput}". Provide only titles, comma-separated.`;

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        console.log("📡 Requesting recommendations for:", userInput);

        const result = await model.generateContent(request);
        const response = await result.response;
        const responseText = response.candidates[0].content.parts[0].text;

        const recommendedMovies = responseText
            .split(/,|\n/)
            .map(m => m.trim())
            .filter(m => m.length > 0);

        // MongoDB save logic
        const newRec = new MovieRecommendation({ userInput, recommendedMovies });
        await newRec.save();

        res.json({ recommendedMovies });

    } catch (error) {
        console.error("❌ Vertex AI Error:", error);
        res.status(500).json({ error: "Generation failed", details: error.message });
    }
};