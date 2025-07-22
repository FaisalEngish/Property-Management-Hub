// Client-side AI helper - makes API calls to server endpoints
// OpenAI should be used on server-side for security

export async function generatePropertyDescription(propertyDetails: {
  name: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  location: string;
}) {
  const response = await fetch('/api/ai/generate-property-description', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(propertyDetails),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate property description');
  }
  
  const data = await response.json();
  return data.description;
}

export async function analyzeGuestReview(reviewText: string) {
  const response = await fetch('/api/ai/analyze-review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reviewText }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze review');
  }
  
  return await response.json();
}

export async function generateMaintenanceTaskSuggestion(propertyType: string, lastMaintenanceDate: string) {
  const response = await fetch('/api/ai/maintenance-suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ propertyType, lastMaintenanceDate }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate maintenance suggestions');
  }
  
  return await response.json();
}

export async function askAssistant(prompt: string) {
  const response = await fetch('/api/ai/ask-assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get AI response');
  }
  
  const data = await response.json();
  return data.response;
}