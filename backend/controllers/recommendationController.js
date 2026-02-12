import { VertexAI } from '@google-cloud/vertexai';
import MovieRecommendation from "../models/Recommendation.js";

// JSON string ko object mein convert karne ka function
const getCredentials = () => {
    try {
        if (!process.env.GCP_SERVICE_ACCOUNT_JSON) {
            throw new Error("GCP_SERVICE_ACCOUNT_JSON is missing in Env Variables");
        }
        return JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);
    } catch (e) {
        console.error("❌ Error parsing GCP Credentials:", e.message);
        return null;
    }
};

// Vertex AI initialize karein (Directly passing credentials object)
const vertexAI = new VertexAI({
    project: 'gen-lang-client-0809119989',
    location: 'us-central1',
    googleAuthOptions: {
        credentials: getCredentials()
    }
});

export const getRecommendations = async (req, res) => {
    const { userInput } = req.body;
    if (!userInput) return res.status(400).json({ error: "User input is required" });

    try {
        const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a movie recommendation expert. Based on the user's preference: "${userInput}", suggest 3 to 5 relevant movies. Provide only titles in a comma-separated list.`;

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        console.log("📡 Requesting recommendations for:", userInput);

        const result = await model.generateContent(request);
        const response = await result.response;

        // Vertex AI ka response candidates array se nikalte hain
        const responseText = response.candidates[0].content.parts[0].text;

        const recommendedMovies = responseText
            .split(/,|\n/)
            .map(m => m.trim())
            .filter(m => m.length > 0)
            .slice(0, 5);

        // Save to Database
        const newRecommendation = new MovieRecommendation({ userInput, recommendedMovies });
        await newRecommendation.save();

        res.json({ recommendedMovies });

    } catch (error) {
        console.error("❌ Vertex AI Error:", error);
        res.status(500).json({ error: "Failed to generate recommendations", details: error.message });
    }
};