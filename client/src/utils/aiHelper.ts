// Client-side AI helper functions for HostPilotPro
import { apiRequest } from "@/lib/queryClient";

export async function askAssistant(prompt: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/test", { prompt });
    return response.result || "No response received";
  } catch (error) {
    console.error("AI Assistant Error:", error);
    throw new Error(`AI Assistant failed: ${error.message}`);
  }
}

export async function generatePropertyDescription(propertyDetails: {
  name: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  location: string;
}): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/property-description", {
      propertyDetails
    });
    return response.description || "No description generated";
  } catch (error) {
    console.error("Property Description Error:", error);
    throw new Error(`Failed to generate property description: ${error.message}`);
  }
}

export async function analyzeGuestReview(reviewText: string): Promise<any> {
  try {
    const response = await apiRequest("POST", "/api/ai/analyze-review", {
      reviewText
    });
    return response.analysis || {};
  } catch (error) {
    console.error("Review Analysis Error:", error);
    throw new Error(`Failed to analyze guest review: ${error.message}`);
  }
}

export async function generateMaintenanceTaskSuggestion(
  propertyType: string, 
  lastMaintenanceDate: string
): Promise<any> {
  try {
    const response = await apiRequest("POST", "/api/ai/maintenance-suggestions", {
      propertyType,
      lastMaintenanceDate
    });
    return response.suggestions || {};
  } catch (error) {
    console.error("Maintenance Suggestions Error:", error);
    throw new Error(`Failed to generate maintenance suggestions: ${error.message}`);
  }
}

export async function sendCustomAIPrompt(prompt: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/custom", { prompt });
    return response.result || "No response received";
  } catch (error) {
    console.error("Custom AI Prompt Error:", error);
    throw new Error(`Failed to process custom prompt: ${error.message}`);
  }
}