const { GoogleGenerativeAI } = require('@google/generative-ai');
const { aiCache } = require('./cacheService');

/**
 * Intelligent Fallback AI generator when Gemini API key is missing or quota is reached
 */
function generateSmartFallbackAIInsight(city, weather) {
  const temp = weather.temp;
  const condition = (weather.condition || 'Clear').toLowerCase();
  const humidity = weather.humidity || 50;
  const windSpeed = weather.windSpeed || 10;
  const isRain = condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder');
  const isSnow = condition.includes('snow');
  const isHot = temp >= 28;
  const isCold = temp <= 10;

  // Travel Advice
  let travelStatus = 'Favorable';
  let travelPrecautions = ['Normal road conditions expected', 'Good visibility for highway and air transit'];
  let travelAdvice = `Great day for commuting and outdoor travel across ${city}. Keep regular travel plans.`;

  if (isRain || windSpeed > 35) {
    travelStatus = 'Caution';
    travelPrecautions = ['Wet roads: increase following distance', 'Allow 15 extra minutes for transit delays', 'Watch for localized street ponding'];
    travelAdvice = `Precipitation and breezy winds in ${city} may slow down road commutes. Carry a compact umbrella.`;
  } else if (temp > 38 || isSnow || windSpeed > 55) {
    travelStatus = 'Hazardous';
    travelPrecautions = ['Check transit authority alerts', 'Drive with emergency kit', 'Avoid non-essential late-night trips'];
    travelAdvice = `Severe conditions in ${city}. Exercise extreme caution when driving or traveling.`;
  }

  // Clothing
  let clothingPrimary = 'Comfortable casual wear: light cotton t-shirt with chinos or denim.';
  let clothingLayers = 'No heavy layers needed; light cardigan optional for late evenings.';
  let clothingAccessories = ['UV-protective sunglasses', 'Breathable sneakers'];

  if (isHot) {
    clothingPrimary = 'Breathable lightweight fabrics: linen shirts, shorts, or moisture-wicking athletic wear.';
    clothingLayers = 'Ultra-light single layer. Sun hat highly recommended.';
    clothingAccessories = ['UV400 Sunglasses', 'Wide-brim hat', 'SPF 50+ Sunscreen', 'Insulated water bottle'];
  } else if (isCold) {
    clothingPrimary = 'Thermal base layer with warm fleece or wool knit sweater and heavy trousers.';
    clothingLayers = 'Triple-layer system: base thermal, fleece mid-layer, wind-resistant outer coat.';
    clothingAccessories = ['Woolen scarf', 'Insulated gloves', 'Beanie', 'Waterproof warm boots'];
  } else if (isRain) {
    clothingPrimary = 'Quick-drying polyester or synthetic blend apparel.';
    clothingLayers = 'Waterproof shell or trench coat over lightweight knit.';
    clothingAccessories = ['Sturdy wind-resistant umbrella', 'Water-resistant footwear', 'Waterproof bag cover'];
  }

  // Activities
  const outdoorActivities = [];
  const indoorActivities = [];

  if (!isRain && !isSnow && temp >= 15 && temp <= 30) {
    outdoorActivities.push('Morning jogging or brisk walking in local city parks');
    outdoorActivities.push('Cycling and urban photography along scenic waterfronts');
    outdoorActivities.push('Al fresco dining and outdoor coffee meetings');
  } else if (isHot) {
    outdoorActivities.push('Early morning walk before 8:30 AM before heat peaks');
    outdoorActivities.push('Shaded outdoor pool or evening leisure stroll');
  } else {
    outdoorActivities.push('Short brisk stroll during peak daylight (12:00 PM - 2:00 PM)');
  }

  indoorActivities.push('Visit contemporary art galleries or local science museums');
  indoorActivities.push('Café workspace sessions and boutique indoor shopping');
  indoorActivities.push('Indoor gym workouts, yoga, or wellness spa sessions');

  // Severe Alerts
  const isSevere = temp > 40 || temp < -10 || windSpeed > 60 || condition.includes('storm') || condition.includes('tornado');
  const severeAlerts = {
    isSevere,
    riskLevel: isSevere ? 'Moderate' : 'None',
    headline: isSevere ? `Weather Advisory for ${city}` : 'No active severe weather watches or warnings',
    instructions: isSevere
      ? ['Stay hydrated and monitor local meteorological updates', 'Secure loose outdoor items']
      : ['General safety precautions apply', 'Enjoy your day safely'],
  };

  const summary = `Currently in ${city}, conditions are ${weather.condition || 'pleasant'} with a temperature of ${temp}°C (feels like ${weather.feelsLike || temp}°C). Humidity is at ${humidity}% with winds blowing at ${windSpeed} km/h. Overall atmospheric stability is high, offering a comfortable and predictable window for daily routines and scheduled activities.`;

  return {
    city,
    country: weather.country || '',
    weatherSnapshot: {
      temp,
      condition: weather.condition,
      humidity,
      windSpeed,
      uvIndex: weather.uvIndex || 3,
    },
    summary,
    recommendations: {
      travel: {
        status: travelStatus,
        precautions: travelPrecautions,
        advice: travelAdvice,
      },
      clothing: {
        primary: clothingPrimary,
        layers: clothingLayers,
        accessories: clothingAccessories,
      },
      activities: {
        outdoor: outdoorActivities,
        indoor: indoorActivities,
        bestTimeOfDay: isHot ? 'Early Morning (6:00 AM - 9:00 AM) or Post-Sunset' : 'Midday (11:00 AM - 3:00 PM)',
      },
      severeAlerts,
    },
    source: 'smart-fallback-engine',
    modelUsed: 'gemini-intelligent-simulation',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate AI Weather Insight using Google Gemini API
 */
async function generateWeatherInsights(city, weatherData, customApiKey, customModel = 'gemini-1.5-flash') {
  const cacheKey = `ai_insight_${city.toLowerCase().trim()}_${Math.round(weatherData.temp)}`;
  const cached = aiCache.get(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: customModel || 'gemini-1.5-flash' });

      const prompt = `
You are WeatherWise AI, an expert meteorologist and lifestyle advisor.
Analyze this weather data for the city of "${city}":
- Temperature: ${weatherData.temp}°C (Feels like: ${weatherData.feelsLike}°C, Min: ${weatherData.temp_min}°C, Max: ${weatherData.temp_max}°C)
- Condition: ${weatherData.condition} (${weatherData.description})
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.windSpeed} km/h
- UV Index: ${weatherData.uvIndex}
- Air Quality Index (AQI): ${weatherData.aqi} (${weatherData.aqiLabel})

Respond ONLY with a strictly valid JSON object (no markdown code blocks, no backticks, no extra text) conforming to this exact structure:
{
  "summary": "2-3 sentences concise, engaging, and professional weather summary",
  "recommendations": {
    "travel": {
      "status": "Favorable" | "Caution" | "Hazardous",
      "precautions": ["precaution 1", "precaution 2"],
      "advice": "detailed commute & transit guidance"
    },
    "clothing": {
      "primary": "main outfit recommendation",
      "layers": "layering guidance",
      "accessories": ["accessory 1", "accessory 2", "accessory 3"]
    },
    "activities": {
      "outdoor": ["activity 1", "activity 2"],
      "indoor": ["activity 1", "activity 2"],
      "bestTimeOfDay": "e.g. Afternoon, Morning"
    },
    "severeAlerts": {
      "isSevere": false,
      "riskLevel": "None" | "Low" | "Moderate" | "High" | "Extreme",
      "headline": "alert headline or All Clear",
      "instructions": ["safety instruction 1"]
    }
  }
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean markdown code fence if returned
      if (text.startsWith('```json')) {
        text = text.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (text.startsWith('```')) {
        text = text.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(text);

      const insight = {
        city,
        country: weatherData.country || '',
        weatherSnapshot: {
          temp: weatherData.temp,
          condition: weatherData.condition,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          uvIndex: weatherData.uvIndex,
        },
        summary: parsed.summary,
        recommendations: parsed.recommendations,
        source: 'gemini-ai',
        modelUsed: customModel || 'gemini-1.5-flash',
        generatedAt: new Date().toISOString(),
      };

      aiCache.set(cacheKey, insight);
      return insight;
    } catch (err) {
      console.warn(`[GeminiService] Gemini API call failed (${err.message}). Activating Smart Fallback AI engine.`);
    }
  }

  // Smart fallback
  const fallbackInsight = generateSmartFallbackAIInsight(city, weatherData);
  aiCache.set(cacheKey, fallbackInsight);
  return fallbackInsight;
}

/**
 * Interactive Q&A with Weather Assistant
 */
async function askWeatherAssistant(city, weatherData, userQuestion, customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are WeatherWise AI assistant. The current weather in ${city} is:
Temperature: ${weatherData.temp}°C, Condition: ${weatherData.condition}, Humidity: ${weatherData.humidity}%, Wind: ${weatherData.windSpeed} km/h.
User Question: "${userQuestion}"
Provide a helpful, precise, friendly answer (maximum 3 paragraphs).
`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return { answer: response.text().trim(), source: 'gemini-ai' };
    } catch (err) {
      console.warn(`[GeminiService] Assistant Q&A failed (${err.message}).`);
    }
  }

  // Fallback assistant response
  return {
    answer: `Based on current weather in ${city} (${weatherData.temp}°C, ${weatherData.condition}): "${userQuestion}" - It looks very manageable! Be mindful of ${weatherData.humidity}% humidity and ${weatherData.windSpeed} km/h winds when planning. Dress comfortably and check forecast updates before venturing out.`,
    source: 'smart-fallback-engine',
  };
}

module.exports = {
  generateWeatherInsights,
  askWeatherAssistant,
  generateSmartFallbackAIInsight,
};
