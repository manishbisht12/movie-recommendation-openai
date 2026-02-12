import { VertexAI } from '@google-cloud/vertexai';
import MovieRecommendation from "../models/Recommendation.js";

// Render par secret files ka path hamesha yahi hota hai
const GCV_KEY_PATH = '/etc/secrets/service-account.json';

const vertexAI = new VertexAI({
    project: 'gen-lang-client-0809119989',
    location: 'us-central1',
    keyFilename: GCV_KEY_PATH // Code ab direct file read karega
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

        const newRec = new MovieRecommendation({ userInput, recommendedMovies });
        await newRec.save();

        res.json({ recommendedMovies });
    } catch (error) {
        console.error("❌ Vertex AI Error:", error);
        res.status(500).json({ error: "Generation failed", details: error.message });
    }
};