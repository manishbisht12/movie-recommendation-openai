import { VertexAI } from '@google-cloud/vertexai';
import MovieRecommendation from "../models/Recommendation.js";

// Helper function to safely parse credentials
const getGCPCredentials = () => {
    const rawJson = process.env.GCP_SERVICE_ACCOUNT_JSON;

    if (!rawJson) {
        console.error("❌ DEBUG: GCP_SERVICE_ACCOUNT_JSON is undefined/empty!");
        return null;
    }

    try {
        // Render par kabhi-kabhi quotes ka issue hota hai, isliye trim kar rahe hain
        return JSON.parse(rawJson.trim());
    } catch (error) {
        console.error("❌ DEBUG: JSON Parse Failed. Check if the JSON format is correct.");
        return null;
    }
};

const credentials = getGCPCredentials();

const vertexAI = new VertexAI({
    project: 'gen-lang-client-0809119989',
    location: 'us-central1',
    googleAuthOptions: {
        credentials: credentials
    }
});

export const getRecommendations = async (req, res) => {
    const { userInput } = req.body;

    if (!credentials) {
        return res.status(500).json({
            error: "Authentication Missing",
            details: "GCP_SERVICE_ACCOUNT_JSON is not being read from Render Env"
        });
    }

    try {
        const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Suggest 3-5 movies for: "${userInput}". Provide only titles, comma-separated.`;

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        const result = await model.generateContent(request);
        const response = await result.response;
        const responseText = response.candidates[0].content.parts[0].text;

        const recommendedMovies = responseText
            .split(/,|\n/)
            .map(m => m.trim())
            .filter(m => m.length > 0);

        const newRec = new MovieRecommendation({ userInput, recommendedMovies });
        await newRec.save();

        res.json({ recommendedMovies });
    } catch (error) {
        console.error("❌ Vertex AI Error:", error);
        res.status(500).json({ error: "Generation failed", details: error.message });
    }
};