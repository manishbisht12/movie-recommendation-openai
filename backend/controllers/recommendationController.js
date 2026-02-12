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
        return res.status(500).json({ error: "Server Configuration Error" });
    }

    try {
        // SDK Initialize karein
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Aapke Google AI Studio list ke mutabik Gemini 3 use kar rahe hain
        // Isse "404 Not Found" issue resolve ho jayega
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview"
        });

        const prompt = `You are a movie recommendation expert. Based on the user's preference: "${userInput}", suggest 3 to 5 relevant movies. 
        Provide only the titles of the movies in a comma-separated list. Do not include any introductory text, numbering, or explanations.`;

        // Content generate karein
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        console.log("Gemini Response:", responseText);

        // 3. Response Cleaning logic
        const cleanedText = responseText.replace(/```/g, '').replace(/csv/g, '').trim();

        // Split by comma or newline and remove extra spaces/numbers
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

        // 5. Send Response to Frontend
        res.json({ recommendedMovies });

    } catch (error) {
        console.error("Error generating recommendations:", error);

        // Agar fir bhi 404 aaye, toh check karein ki SDK version latest hai ya nahi
        res.status(500).json({
            error: "Failed to generate recommendations",
            details: error.message
        });
    }
};