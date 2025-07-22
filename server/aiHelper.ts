import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askAssistant(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to get AI response");
  }
}

// Additional AI helper functions for HostPilotPro
export async function generatePropertyDescription(propertyDetails: {
  name: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  location: string;
}) {
  const prompt = `Generate a compelling property description for a vacation rental with the following details:
- Name: ${propertyDetails.name}
- Bedrooms: ${propertyDetails.bedrooms}
- Bathrooms: ${propertyDetails.bathrooms}
- Location: ${propertyDetails.location}
- Amenities: ${propertyDetails.amenities.join(', ')}

Please write a professional, engaging description that would attract guests.`;

  return await askAssistant(prompt);
}

export async function analyzeGuestReview(reviewText: string) {
  const prompt = `Analyze this guest review and provide:
1. Sentiment (positive/negative/neutral)
2. Key issues mentioned (if any)
3. Suggested improvements
4. Overall rating prediction (1-5 stars)

Review: "${reviewText}"

Please respond in JSON format.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to analyze review");
  }
}

export async function generateMaintenanceTaskSuggestion(propertyType: string, lastMaintenanceDate: string) {
  const prompt = `Based on a ${propertyType} property with last maintenance done on ${lastMaintenanceDate}, suggest upcoming maintenance tasks that should be scheduled. Include:
1. Task name
2. Priority level (Low/Medium/High)
3. Estimated timeframe
4. Brief description

Respond in JSON format with an array of tasks.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate maintenance suggestions");
  }
}

export async function generateSmartGuestResponse(guestMessage: string, propertyInfo: any) {
  const prompt = `You are a helpful property manager assistant. A guest has sent this message: "${guestMessage}"

Property context: ${JSON.stringify(propertyInfo)}

Generate a friendly, helpful response that addresses their query. Keep it professional but warm.`;

  return await askAssistant(prompt);
}