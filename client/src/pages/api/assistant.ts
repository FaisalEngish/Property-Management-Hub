// This is a client-side reference file for the assistant API
// The actual API endpoint is implemented in server/routes.ts

export interface AssistantRequest {
  prompt: string;
}

export interface AssistantResponse {
  result: string;
}

export async function callAssistant(prompt: string): Promise<string> {
  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AssistantResponse = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error calling assistant:", error);
    throw error;
  }
}

// Usage example:
// const response = await callAssistant("What tasks should I worry about today?");