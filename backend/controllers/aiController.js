
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
    console.error('CRITICAL: GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getSuggestions = async (req, res) => {
    try {
        const { city, interests, trip_duration } = req.body;

        // Input validation
        if (!city || typeof city !== 'string' || city.trim().length === 0) {
            return res.status(400).json({ error: 'Valid city name is required' });
        }

        // Validate API key
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing');
            return res.status(500).json({ error: 'AI service is not configured properly' });
        }

        console.log(`[AI] Generating suggestions for city: ${city}, duration: ${trip_duration || '3 days'}`);

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Act as a local travel expert and suggest exactly 5 distinct activities for a trip to ${city}.
Trip Duration: ${trip_duration || '3 days'}
Interests: ${interests || 'General sightseeing, food, history'}

IMPORTANT: Return ONLY a valid JSON array with NO markdown formatting, NO backticks, NO explanatory text.
Each object must have these exact fields:
{
  "title": "Activity Name",
  "category": "activity" or "food" or "other",
  "cost_est": 50,
  "description": "Brief description"
}

Example format:
[{"title":"Visit Eiffel Tower","category":"activity","cost_est":25,"description":"Iconic landmark"},{"title":"Louvre Museum","category":"activity","cost_est":20,"description":"World-famous art museum"}]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('[AI] Raw response received, length:', text.length);

        // Multiple cleanup strategies
        let cleanText = text.trim();

        // Remove markdown code blocks
        cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // Remove any leading/trailing whitespace
        cleanText = cleanText.trim();

        // Try to extract JSON array if wrapped in text
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            cleanText = jsonMatch[0];
        }

        try {
            const jsonResponse = JSON.parse(cleanText);

            // Validate response structure
            if (!Array.isArray(jsonResponse)) {
                throw new Error('Response is not an array');
            }

            // Validate each suggestion
            const validSuggestions = jsonResponse.filter(item =>
                item.title && item.category && typeof item.cost_est !== 'undefined'
            );

            if (validSuggestions.length === 0) {
                throw new Error('No valid suggestions in response');
            }

            console.log(`[AI] Successfully parsed ${validSuggestions.length} suggestions`);
            res.json({ suggestions: validSuggestions });

        } catch (parseError) {
            console.error("[AI] JSON Parse Error:", parseError.message);
            console.error("[AI] Attempted to parse:", cleanText.substring(0, 200));

            // Return a user-friendly error instead of raw text
            res.status(500).json({
                error: 'AI returned invalid format. Please try again.',
                debug: process.env.NODE_ENV === 'development' ? cleanText.substring(0, 200) : undefined
            });
        }

    } catch (err) {
        console.error("[AI] Gemini API Error:", err.message);
        console.error("[AI] Full error:", err);

        // Provide specific error messages
        if (err.message?.includes('API key')) {
            res.status(500).json({ error: 'AI service authentication failed' });
        } else if (err.message?.includes('quota')) {
            res.status(429).json({ error: 'AI service quota exceeded. Please try again later.' });
        } else {
            res.status(500).json({ error: 'Failed to generate suggestions. Please try again.' });
        }
    }
};

// Generate detailed trip plan
exports.generateTripPlan = async (req, res) => {
    try {
        const { city, duration, interests, budget } = req.body;

        // Input validation
        if (!city || typeof city !== 'string' || city.trim().length === 0) {
            return res.status(400).json({ error: 'Valid city name is required' });
        }

        // Validate API key
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing');
            return res.status(500).json({ error: 'AI service is not configured properly' });
        }

        console.log(`[AI] Generating detailed trip plan for: ${city}, duration: ${duration || '3 days'}`);

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Create a comprehensive, detailed trip plan for ${city}.

Trip Details:
- Duration: ${duration || '3 days'}
- Interests: ${interests || 'General sightseeing, food, culture, history'}
- Budget: ${budget || 'Moderate'}

Generate a detailed day-by-day itinerary in JSON format with the following structure:

{
  "overview": "Brief overview of the trip (2-3 sentences)",
  "best_time_to_visit": "Best season/months to visit",
  "estimated_budget": "Total estimated budget in INR",
  "daily_itinerary": [
    {
      "day": 1,
      "title": "Day title/theme",
      "morning": {
        "time": "9:00 AM - 12:00 PM",
        "activities": ["Activity 1", "Activity 2"],
        "description": "What to do in the morning"
      },
      "afternoon": {
        "time": "12:00 PM - 5:00 PM",
        "activities": ["Activity 1", "Activity 2"],
        "description": "What to do in the afternoon"
      },
      "evening": {
        "time": "5:00 PM - 9:00 PM",
        "activities": ["Activity 1", "Activity 2"],
        "description": "What to do in the evening"
      },
      "meals": {
        "breakfast": "Restaurant/place suggestion",
        "lunch": "Restaurant/place suggestion",
        "dinner": "Restaurant/place suggestion"
      },
      "estimated_cost": 5000
    }
  ],
  "must_visit_places": [
    {
      "name": "Place name",
      "description": "Brief description",
      "estimated_time": "2-3 hours",
      "cost": 500,
      "category": "historical/cultural/nature/food/shopping"
    }
  ],
  "travel_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "local_cuisine": ["Dish 1", "Dish 2", "Dish 3"],
  "transportation": "How to get around the city"
}

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO backticks, NO explanatory text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('[AI] Trip plan response received, length:', text.length);

        // Clean up response
        let cleanText = text.trim();
        cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        cleanText = cleanText.trim();

        // Extract JSON
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanText = jsonMatch[0];
        }

        try {
            const tripPlan = JSON.parse(cleanText);

            // Validate structure
            if (!tripPlan.daily_itinerary || !Array.isArray(tripPlan.daily_itinerary)) {
                throw new Error('Invalid trip plan structure');
            }

            console.log(`[AI] Successfully generated trip plan for ${city}`);
            res.json({ trip_plan: tripPlan });

        } catch (parseError) {
            console.error("[AI] JSON Parse Error:", parseError.message);
            console.error("[AI] Attempted to parse:", cleanText.substring(0, 200));

            res.status(500).json({
                error: 'AI returned invalid format. Please try again.',
                debug: process.env.NODE_ENV === 'development' ? cleanText.substring(0, 200) : undefined
            });
        }

    } catch (err) {
        console.error("[AI] Trip plan generation error:", err.message);
        console.error("[AI] Full error:", err);

        if (err.message?.includes('API key')) {
            res.status(500).json({ error: 'AI service authentication failed' });
        } else if (err.message?.includes('quota')) {
            res.status(429).json({ error: 'AI service quota exceeded. Please try again later.' });
        } else {
            res.status(500).json({ error: 'Failed to generate trip plan. Please try again.' });
        }
    }
};
