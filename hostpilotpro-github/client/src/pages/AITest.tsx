import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  askAssistant, 
  generatePropertyDescription, 
  analyzeGuestReview, 
  generateMaintenanceTaskSuggestion 
} from "@/utils/aiHelper";
import { Brain, MessageSquare, Home, Wrench } from "lucide-react";

export default function AITest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { toast } = useToast();

  const testBasicAI = async () => {
    setIsLoading(true);
    try {
      const response = await askAssistant("Hello! Can you confirm that you're working properly?");
      setResult(response || "No response received");
      toast({
        title: "Success",
        description: "AI Assistant is working!",
      });
    } catch (error) {
      console.error("AI Test Error:", error);
      setResult(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: "AI Assistant failed to respond",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testPropertyDescription = async () => {
    setIsLoading(true);
    try {
      const response = await generatePropertyDescription({
        name: "Villa Test",
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["Pool", "WiFi", "Kitchen"],
        location: "Koh Samui, Thailand"
      });
      setResult(response || "No description generated");
      toast({
        title: "Success",
        description: "Property description generated!",
      });
    } catch (error) {
      console.error("Property Description Error:", error);
      setResult(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to generate property description",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testReviewAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await analyzeGuestReview("The villa was amazing! Great location, clean rooms, and helpful staff. Only issue was the WiFi was slow.");
      setResult(JSON.stringify(response, null, 2));
      toast({
        title: "Success",
        description: "Review analysis completed!",
      });
    } catch (error) {
      console.error("Review Analysis Error:", error);
      setResult(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to analyze review",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testMaintenanceSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await generateMaintenanceTaskSuggestion("villa", "2025-01-01");
      setResult(JSON.stringify(response, null, 2));
      toast({
        title: "Success",
        description: "Maintenance suggestions generated!",
      });
    } catch (error) {
      console.error("Maintenance Suggestions Error:", error);
      setResult(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to generate maintenance suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Integration Test</h1>
        <p className="text-muted-foreground">
          Test the OpenAI integration in HostPilotPro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Basic AI Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testBasicAI} 
              disabled={isLoading}
              className="w-full"
            >
              Test AI Assistant
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testPropertyDescription} 
              disabled={isLoading}
              className="w-full"
            >
              Generate Description
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Review Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testReviewAnalysis} 
              disabled={isLoading}
              className="w-full"
            >
              Analyze Sample Review
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Maintenance Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testMaintenanceSuggestions} 
              disabled={isLoading}
              className="w-full"
            >
              Generate Suggestions
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Response</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={result}
            readOnly
            placeholder="AI responses will appear here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}