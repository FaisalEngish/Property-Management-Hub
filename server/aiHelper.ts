import OpenAI from "openai";
import { getUpcomingTasks } from "./services/taskService";
import { storage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askAssistant(prompt: string, organizationId = "default-org") {
  try {
    console.log("Making OpenAI API call with prompt:", prompt.substring(0, 100) + "...");
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Fetch user's properties for context
    const properties = await storage.getProperties(organizationId);
    const propertyList = properties.length > 0 
      ? properties.map(p => `• ${p.name} (${p.bedrooms}BR/${p.bathrooms}BA, ${p.status})`).join("\n")
      : "No properties found.";

    // Fetch internal task data for context
    const tasks = await getUpcomingTasks();
    const taskSummary = tasks.length > 0 
      ? tasks.map(t => `• ${t.title} at ${t.property || 'Unknown Property'} (due: ${t.dueDate?.toDateString() || 'No date'}) - ${t.priority} priority`).join("\n")
      : "No upcoming tasks in the next 7 days.";

    const systemContext = `You are Mr. Pilot, the AI assistant for HostPilotPro property management platform.

Here are the user's properties:
${propertyList}

Here are current active tasks:
${taskSummary}

You help with property management, task scheduling, guest services, and financial tracking. Use the property and task context above to provide relevant, personalized assistance.

Now answer this user query:
${prompt}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system", 
          content: systemContext
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
    });

    console.log("OpenAI response received:", {
      choices: response.choices?.length,
      content: response.choices?.[0]?.message?.content?.substring(0, 100) + "..."
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response from OpenAI API");
    }

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    return content;
  } catch (error) {
    console.error("OpenAI API Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      status: error.status,
      type: error.type
    });
    throw new Error(`Failed to get AI response: ${error.message}`);
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