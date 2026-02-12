import { GoogleGenerativeAI } from "@google/generative-ai";
import MovieRecommendation from "../models/Recommendation.js";

export const getRecommendations = async (req, res) => {
    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
    }

    // 1. Render Dashboard mein GEMINI_API_KEY zaroor check karein!
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing!");
        return res.status(500).json({ error: "Server Configuration Error: API Key is missing" });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a movie recommendation expert. Based on the user's preference: "${userInput}", suggest 3 to 5 relevant movies. 
    Provide only the titles of the movies in a comma-separated list. No other text.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up response: remove potential markdown backticks, split by comma or newline
        const cleanedText = responseText.replace(/```/g, '').replace(/csv/g, '').trim();
        const recommendedMovies = cleanedText
            .split(/,|\n/)
            .map(movie => movie.replace(/^\d+\.\s*/, '').trim()) // remove numbering if any
            .filter(movie => movie.length > 0)
            .slice(0, 5);

        // Save to database
        const newRecommendation = new MovieRecommendation({
            userInput,
            recommendedMovies,
        });
        await newRecommendation.save();

        res.json({ recommendedMovies });
    } catch (error) {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
};
