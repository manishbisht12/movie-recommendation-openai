import { VertexAI } from '@google-cloud/vertexai';
import MovieRecommendation from "../models/Recommendation.js";

// 1. Google Cloud Credentials (Inline Object)
// Isse Render par "Could not load default credentials" ka error fix ho jayega
const keyData = {
    "type": "service_account",
    "project_id": "gen-lang-client-0809119989",
    "private_key_id": "48bce6858be278661f75487109659c333896b2eb",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0JmIJecdRaf+6\nVvShh1sgIXFZCYIkrCxiYGonxjbLP55Fk0Y/Ib/4hKdvWh1wcwdnllHyU7gf8G73\nT3Q8PSyntp89+I7m33XI9xvCF/wG22BLFT5mDvCdaab/hUE1sosH4G7AfUq4z9MB\n+LASAIsZqqKPoVX2Ao5Qxyb9fwT80r5V1tDurZKboorOjaVQO2FvKpODA2eIXUUr\nlAfD/93gw5mkRviS43K/G/lsVcfvctI28p83gjNzBK+v9cw5C3kjb/mQAVS0vOBN\nD8SFXtvLGLLw6BM9mEHIow+pZhtNBT3v1IeDj2LLW2fHxmOtAzdyC3y5h1my4c/L\n3h2TsSnlAgMBAAECggEAI7reJGd7FQZrQkPHWrcsJ2wCnWhxn8DnP67ENzXMvdSV\nGVMLsm9I8isrQz5SCvDBlfW+NIwOv4TyGUpwsRboAa6KmGGxRBCrfYunPYCAy8Jc\nb5/bw6WwauQey1ycUaBjC1Gj3bkr5gpQHTq7/yIM9K7/dXHICRY6MELDlLEJ5fO4\nPArwheLv7yx9j9TzdODUq391/odIpaZdNUzf7RYcwLBq2V2E1jfz5WF7cLCX0ia9\noq3KSdojnOlyzjzaq8x55sPGgPCirxTB0vWP/0vF2o7HZO2JmtQffNClPHyEEMpl\nsLjN4LzhlxhT3QyHWetNNX3wyqhcI4DMTW0xbvEa6QKBgQDY6pTTmXWXBteucSub\n+dA3pl04XOH1cqj6nSTNT/cb/yb2NMd0RbSVCwbqcXrvbLEFo0/eweaN5yA3U2+h\n42vUQwFcOWPBRgyEspjS1wK0hRM6UoQxDdna0mtbuPpYV6JuoevEEHUXNlvkm6Lj\nY3Hwm1ve6104gOdrMjaDiM/euQKBgQDUm+zuQUDyjccPWULzwBYUfhn+hNLOHZ8V\nIq/IsOaVuCGFAZVJHQw9cud5H1vbfB0arv5Ww3u4yZSufUYOHlE4PpDKOAqR/sxO\njRvXSaeCH/GH7W6rukdOM5bh9/WKooAfBbKhQiLNSyI+yf2wUwwvfUhf8kq/n8ng\n1iXZY4BujQKBgQDNBixVNB8o+JazktQdQSnE78H8nA4W6KE+/3jhdkuicrBo1coP\n5DKjDSEkRs5jruBC6/F6ItvAFE0m/f3tjf9FSW/ns3bOH1+FrSk1X3R3G7Do10WK\n+ASKB4jh0R0OkwY8e19UmhmSLxb8JP743e279ZwIP36FAZG6iGNuP8n6QQKBgCAC\nddKNOoUKOX0jGERwmCJvteQvBToJFalt9n9FuwGxnkJTMbG3UN9zjEwdH4xVDGC3\nFg3kEp2Io/z9WW3IvLu2F8CKXXULoqD098sbCMA7pPatFat/OTsZ406UMYC05ItH\nJVTIC0tTU42Whb5lUoFX4Gypov1kxlU2iK5JH84FAoGAdo5F2HY41mf6jAJBRQPL\ntFE9a3LDKpowAQxQVuVnWaKuIq+iWQ05w3qG60LIbxhElhxdO9YSq6UpC/57y6Ji\ndyt8ewc1pR6MWASq97aqTUTWA9qpFqtsghrXaGql5Kczn4wtOlN/9QAHoFw/oYdi\n94ozNe1c7mPjp2CCdwYeZic=\n-----END PRIVATE KEY-----\n",
    "client_email": "gemini-access@gen-lang-client-0809119989.iam.gserviceaccount.com",
};

// 2. Vertex AI Initialization
// Hum 'googleAuthOptions' ka use karke direct credentials pass kar rahe hain
const vertexAI = new VertexAI({
    project: keyData.project_id,
    location: 'us-central1', // Render ke liye 'us-central1' sabse stable hai
    googleAuthOptions: {
        credentials: keyData
    }
});

export const getRecommendations = async (req, res) => {
    const { userInput } = req.body;

    // Input Check
    if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
    }

    try {
        // Model select karein
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });

        const prompt = `You are a movie recommendation expert. Based on the user's preference: "${userInput}", suggest 3 to 5 relevant movies. 
        Provide only the titles of the movies in a comma-separated list. Do not include numbering or extra text.`;

        // Request Object for Vertex AI
        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        console.log("📡 Requesting recommendations for:", userInput);

        // API Call
        const result = await model.generateContent(request);
        const response = await result.response;

        // Response Extract karna (Vertex AI format)
        const responseText = response.candidates[0].content.parts[0].text;

        console.log("✅ Vertex AI Response:", responseText);

        // 3. Response Cleaning & Formatting
        const recommendedMovies = responseText
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

        // 5. Send to Frontend
        res.json({ recommendedMovies });

    } catch (error) {
        console.error("❌ Vertex AI Error:", error);
        res.status(500).json({
            error: "Failed to generate recommendations",
            details: error.message
        });
    }
};