import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  MessageSquare, 
  Home, 
  Wrench, 
  Sparkles,
  Bot,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";

export default function AIFeatureDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [reviewText, setReviewText] = useState("The villa was amazing! Great location, clean rooms, and helpful staff. Only issue was the WiFi was slow.");
  const { toast } = useToast();

  // Test basic AI assistant
  const testBasicAI = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/test", {
        prompt: "Hello! Please confirm you're working and tell me about HostPilotPro's AI capabilities."
      });
      setResult(response.result || "No response received");
      toast({
        title: "AI Assistant Working!",
        description: "Basic AI functionality confirmed",
      });
    } catch (error) {
      console.error("AI Test Error:", error);
      setResult(`Error: ${error.message}`);
      toast({
        title: "AI Error",
        description: "Check if OpenAI API key is configured",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test property description generation
  const testPropertyDescription = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/property-description", {
        propertyDetails: {
          name: "Villa Sunset Paradise",
          bedrooms: 4,
          bathrooms: 3,
          amenities: ["Private Pool", "Ocean View", "WiFi", "Modern Kitchen", "Air Conditioning"],
          location: "Koh Samui, Thailand"
        }
      });
      setResult(response.description || "No description generated");
      toast({
        title: "Success!",
        description: "AI property description generated",
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

  // Test guest review analysis
  const testReviewAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/analyze-review", {
        reviewText: reviewText
      });
      setResult(JSON.stringify(response.analysis, null, 2));
      toast({
        title: "Review Analyzed!",
        description: "AI sentiment analysis completed",
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

  // Test maintenance suggestions
  const testMaintenanceSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/maintenance-suggestions", {
        propertyType: "luxury villa",
        lastMaintenanceDate: "2024-01-15"
      });
      setResult(JSON.stringify(response.suggestions, null, 2));
      toast({
        title: "Maintenance Suggestions Generated!",
        description: "AI-powered maintenance recommendations ready",
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

  // Test custom AI prompt
  const testCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a custom prompt to test",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/custom", {
        prompt: customPrompt
      });
      setResult(response.result || "No response received");
      toast({
        title: "Custom AI Response!",
        description: "Your custom prompt was processed",
      });
    } catch (error) {
      console.error("Custom Prompt Error:", error);
      setResult(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to process custom prompt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Feature Dashboard</h1>
          <p className="text-muted-foreground">Test and explore HostPilotPro's AI capabilities</p>
        </div>
      </div>

      {/* AI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">OpenAI GPT-4o Integration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Features</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8+</div>
            <p className="text-xs text-muted-foreground">AI-powered tools available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integration</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Live</div>
            <p className="text-xs text-muted-foreground">Real-time AI responses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="testing">AI Testing</TabsTrigger>
          <TabsTrigger value="features">AI Features</TabsTrigger>
          <TabsTrigger value="examples">Live Examples</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* AI Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    AI Test Suite
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={testBasicAI} 
                    disabled={isLoading} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Test Basic AI Assistant
                  </Button>
                  
                  <Button 
                    onClick={testPropertyDescription} 
                    disabled={isLoading} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Generate Property Description
                  </Button>
                  
                  <Button 
                    onClick={testMaintenanceSuggestions} 
                    disabled={isLoading} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Generate Maintenance Tasks
                  </Button>
                  
                  <Button 
                    onClick={testReviewAnalysis} 
                    disabled={isLoading} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Analyze Guest Review
                  </Button>
                </CardContent>
              </Card>

              {/* Custom Prompt */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom AI Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Enter your custom AI prompt here..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={testCustomPrompt} 
                    disabled={isLoading || !customPrompt.trim()}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Send Custom Prompt
                  </Button>
                </CardContent>
              </Card>

              {/* Review Analysis Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Analysis Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Enter a guest review to analyze..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        AI Response
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
                    {result ? (
                      <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Click any test button to see AI results here
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* AI Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  Property AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Property Description Generation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Amenity Recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Pricing Suggestions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  Guest AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Review Sentiment Analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Smart Guest Responses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Guest Request Processing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Maintenance AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Task Suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Priority Assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Preventive Scheduling
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Examples Tab */}
        <TabsContent value="examples" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI in Daily Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="secondary">✨ AI Features Active</Badge>
                  <p className="text-sm text-muted-foreground">
                    AI is actively working in these areas:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• Guest review analysis and sentiment tracking</li>
                    <li>• Automated maintenance task suggestions</li>
                    <li>• Smart guest communication responses</li>
                    <li>• Property description optimization</li>
                    <li>• Task priority assessment</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available AI Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline">Navigation: Settings → AI Tools</Badge>
                  <ul className="space-y-2 text-sm">
                    <li>• AI Feedback Monitor (Guest insights)</li>
                    <li>• AI Task Manager (Smart scheduling)</li>
                    <li>• AI Notifications & Reminders</li>
                    <li>• Guest Portal Smart Requests</li>
                    <li>• Property AI Recommendations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">OpenAI GPT-4o Integration</p>
                    <p className="text-sm text-muted-foreground">Latest AI model with enhanced capabilities</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Real-time Processing</p>
                    <p className="text-sm text-muted-foreground">Instant AI responses for guest and property management</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Multi-language Support</p>
                    <p className="text-sm text-muted-foreground">AI works in multiple languages for global guests</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Context-Aware Responses</p>
                    <p className="text-sm text-muted-foreground">AI understands property and guest context</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}