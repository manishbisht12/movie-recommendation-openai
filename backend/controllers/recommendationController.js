import { VertexAI } from '@google-cloud/vertexai';
import MovieRecommendation from "../models/Recommendation.js";

// 1. Pehle credentials load karein
const gcpCredentials = process.env.GCP_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON)
    : null;

// 2. VertexAI initialize karein
// Dhyaan dein: 'googleAuthOptions' ko constructor ke andar hi pass karna hai
const vertexAI = new VertexAI({
    project: 'gen-lang-client-0809119989',
    location: 'us-central1',
    googleAuthOptions: {
        credentials: gcpCredentials
    }
});

export const getRecommendations = async (req, res) => {
    const { userInput } = req.body;
    if (!userInput) return res.status(400).json({ error: "Input required" });

    // Check agar credentials load hue ya nahi
    if (!gcpCredentials) {
        console.error("❌ ERROR: GCP_SERVICE_ACCOUNT_JSON is missing in Render Env Variables!");
        return res.status(500).json({ error: "Server authentication misconfigured" });
    }

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

        console.log("✅ Vertex AI Response:", responseText);

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