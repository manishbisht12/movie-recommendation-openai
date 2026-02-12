import { GoogleGenerativeAI } from "@google/generative-ai";
import MovieRecommendation from "../models/Recommendation.js";

export const getRecommendations = async (req, res) => {
    const { userInput } = req.body;

    // 1. Input Validation
    if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
    }

    // 2. API Key Check
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing in Environment Variables!");
        return res.status(500).json({ error: "Server Configuration Error: API Key missing" });
    }

    try {
        // SDK Initialize
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Use stable gemini-1.5-flash model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a movie recommendation expert. Based on the user's preference: "${userInput}", suggest 3 to 5 relevant movies. 
        Provide only the titles of the movies in a comma-separated list. Do not include any introductory text, numbering, or explanations.`;

        console.log("📡 Requesting recommendations for:", userInput);

        // Content generation
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("✅ Gemini Response:", responseText);

        // 3. Cleaning logic
        const cleanedText = responseText.replace(/```/g, '').replace(/csv/g, '').trim();

        const recommendedMovies = cleanedText
            .split(/,|\n/)
            .map(movie => movie.replace(/^\d+\.\s*/, '').trim())
            .filter(movie => movie.length > 0)
            .slice(0, 5);

        // 4. Save to MongoDB
        const newRecommendation = new MovieRecommendation({
            userInput,
            recommendedMovies,
        });
        await newRecommendation.save();

        // 5. Success response
        res.json({ recommendedMovies });

    } catch (error) {
        console.error("❌ Error generating recommendations:", error);

        // Detailed error message for location issues
        if (error.message.includes("location is not supported")) {
            return res.status(403).json({
                error: "Google Gemini API is not available in your server's current location (Region)."
            });
        }

        res.status(500).json({
            error: "Failed to generate recommendations",
            details: error.message
        });
    }
};