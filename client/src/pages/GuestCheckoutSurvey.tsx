import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Heart, 
  Home, 
  MapPin, 
  Users, 
  MessageSquare, 
  Award, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Settings,
  BarChart3,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  AlertCircle,
  Calendar,
  FileText,
  PlusCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";

// Guest Survey Form Component
interface GuestSurveyFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function GuestSurveyForm({ onSubmit, isLoading }: GuestSurveyFormProps) {
  const [ratings, setRatings] = useState({
    checkIn: 0,
    cleanliness: 0,
    property: 0,
    location: 0,
    team: 0,
    communication: 0,
    overall: 0
  });
  
  const [comments, setComments] = useState({
    improvements: "",
    recommendations: ""
  });
  
  const [guestInfo, setGuestInfo] = useState({
    guestId: "",
    bookingId: "",
    propertyId: ""
  });

  const handleRatingClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const surveyData = {
      ...guestInfo,
      checkInRating: ratings.checkIn,
      cleanlinessRating: ratings.cleanliness,
      propertyRating: ratings.property,
      locationRating: ratings.location,
      teamRating: ratings.team,
      communicationRating: ratings.communication,
      overallRating: ratings.overall,
      improvementComments: comments.improvements,
      recommendationComments: comments.recommendations,
      surveyType: 'checkout'
    };
    
    onSubmit(surveyData);
  };

  const renderStars = (category: keyof typeof ratings) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              value <= ratings[category]
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
            onClick={() => handleRatingClick(category, value)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {ratings[category] > 0 ? `${ratings[category]} star${ratings[category] !== 1 ? 's' : ''}` : 'Not rated'}
        </span>
      </div>
    );
  };

  const ratingCategories = [
    { key: 'checkIn' as const, label: 'Check-in Experience', icon: Heart },
    { key: 'cleanliness' as const, label: 'Cleanliness', icon: Home },
    { key: 'property' as const, label: 'Property Quality', icon: Award },
    { key: 'location' as const, label: 'Location', icon: MapPin },
    { key: 'team' as const, label: 'Team Service', icon: Users },
    { key: 'communication' as const, label: 'Communication', icon: MessageSquare },
    { key: 'overall' as const, label: 'Overall Experience', icon: TrendingUp }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Guest Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Guest Information
          </CardTitle>
          <CardDescription>
            Please provide your booking details to submit your feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="guestId">Guest ID</Label>
              <Input
                id="guestId"
                value={guestInfo.guestId}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, guestId: e.target.value }))}
                placeholder="Enter your guest ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="bookingId">Booking Reference</Label>
              <Input
                id="bookingId"
                value={guestInfo.bookingId}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, bookingId: e.target.value }))}
                placeholder="Enter booking reference"
              />
            </div>
            <div>
              <Label htmlFor="propertyId">Property ID</Label>
              <Input
                id="propertyId"
                value={guestInfo.propertyId}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, propertyId: e.target.value }))}
                placeholder="Enter property ID"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Your Experience</CardTitle>
          <CardDescription>
            Please rate each aspect of your stay from 1 to 5 stars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ratingCategories.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{label}</span>
              </div>
              {renderStars(key)}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Feedback</CardTitle>
          <CardDescription>
            Help us improve by sharing your thoughts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="improvements">What could we improve?</Label>
            <Textarea
              id="improvements"
              value={comments.improvements}
              onChange={(e) => setComments(prev => ({ ...prev, improvements: e.target.value }))}
              placeholder="Share any suggestions for improvement..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="recommendations">Would you recommend us to others?</Label>
            <Textarea
              id="recommendations"
              value={comments.recommendations}
              onChange={(e) => setComments(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Tell us why you would or wouldn't recommend us..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}

// Survey Management Dashboard
export default function GuestCheckoutSurvey() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("form");
  const [filters, setFilters] = useState({
    propertyId: "",
    surveyType: "",
    dateRange: undefined as any
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated && user?.role !== 'guest'
  });

  // Fetch surveys for admin/PM
  const { data: surveys = [], isLoading: loadingSurveys } = useQuery({
    queryKey: ["/api/guest-checkout-surveys", filters],
    enabled: isAuthenticated && user?.role !== 'guest'
  });

  // Fetch survey analytics
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["/api/survey-analytics", filters.propertyId],
    enabled: isAuthenticated && user?.role !== 'guest'
  });

  // Fetch survey alerts
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ["/api/survey-alerts"],
    enabled: isAuthenticated && user?.role !== 'guest'
  });

  // Create survey mutation
  const createSurveyMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/guest-checkout-surveys", data),
    onSuccess: () => {
      toast({
        title: "Survey Submitted",
        description: "Thank you for your feedback! We value your input."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkout-surveys"] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your survey. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Review survey mutation
  const reviewSurveyMutation = useMutation({
    mutationFn: ({ id, adminNotes }: { id: number; adminNotes: string }) =>
      apiRequest("POST", `/api/guest-checkout-surveys/${id}/review`, { adminNotes }),
    onSuccess: () => {
      toast({
        title: "Survey Reviewed",
        description: "Survey has been reviewed and processed."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkout-surveys"] });
    }
  });

  const getSentimentColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentBadge = (rating: number) => {
    if (rating >= 4.5) return <Badge variant="default" className="bg-green-100 text-green-800">Positive</Badge>;
    if (rating >= 3.5) return <Badge variant="secondary">Neutral</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  // Guest form view
  if (!isAuthenticated || user?.role === 'guest') {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Guest Feedback Survey</h1>
          <p className="text-gray-600">
            We value your opinion! Please take a moment to share your experience with us.
          </p>
        </div>

        <GuestSurveyForm
          onSubmit={(data) => createSurveyMutation.mutate(data)}
          isLoading={createSurveyMutation.isPending}
        />
      </div>
    );
  }

  // Admin/PM dashboard view
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Guest Survey Management</h1>
          <p className="text-gray-600">Monitor and analyze guest feedback</p>
        </div>
        <Button onClick={() => setActiveTab("form")}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Test Survey Form
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Surveys
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Test Form
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                    <p className="text-2xl font-bold">{surveys.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">
                      {analytics?.averageOverallRating?.toFixed(1) || "0.0"}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Positive Reviews</p>
                    <p className="text-2xl font-bold text-green-600">
                      {surveys.filter(s => s.overallRating >= 4).length}
                    </p>
                  </div>
                  <ThumbsUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{alerts.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Surveys */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Surveys</CardTitle>
              <CardDescription>Latest guest feedback submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {surveys.slice(0, 5).map((survey: any) => (
                  <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Guest {survey.guestId}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(survey.submittedAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className={getSentimentColor(survey.overallRating)}>
                          {survey.overallRating.toFixed(1)}
                        </span>
                      </div>
                      {getSentimentBadge(survey.overallRating)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Surveys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Property</Label>
                  <Select value={filters.propertyId} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, propertyId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Properties</SelectItem>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Survey Type</Label>
                  <Select value={filters.surveyType} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, surveyType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="checkout">Check-out Survey</SelectItem>
                      <SelectItem value="post_checkin">Post Check-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Range</Label>
                  <DatePickerWithRange
                    date={filters.dateRange}
                    onDateChange={(date) => setFilters(prev => ({ ...prev, dateRange: date }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Surveys List */}
          <Card>
            <CardHeader>
              <CardTitle>All Surveys</CardTitle>
              <CardDescription>
                {loadingSurveys ? "Loading surveys..." : `${surveys.length} survey(s) found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {surveys.map((survey: any) => (
                  <div key={survey.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">Guest ID: {survey.guestId}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted: {format(new Date(survey.submittedAt), "PPP")}
                        </p>
                        {survey.bookingId && (
                          <p className="text-sm text-gray-600">
                            Booking: {survey.bookingId}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentBadge(survey.overallRating)}
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{survey.overallRating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Check-in:</span>
                          <span>{survey.checkInRating}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cleanliness:</span>
                          <span>{survey.cleanlinessRating}/5</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Property:</span>
                          <span>{survey.propertyRating}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Location:</span>
                          <span>{survey.locationRating}/5</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Team:</span>
                          <span>{survey.teamRating}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Communication:</span>
                          <span>{survey.communicationRating}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    {(survey.improvementComments || survey.recommendationComments) && (
                      <div className="space-y-2">
                        {survey.improvementComments && (
                          <div>
                            <h4 className="text-sm font-medium">Improvements:</h4>
                            <p className="text-sm text-gray-600">{survey.improvementComments}</p>
                          </div>
                        )}
                        {survey.recommendationComments && (
                          <div>
                            <h4 className="text-sm font-medium">Recommendations:</h4>
                            <p className="text-sm text-gray-600">{survey.recommendationComments}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const adminNotes = prompt("Add admin notes:");
                          if (adminNotes) {
                            reviewSurveyMutation.mutate({ id: survey.id, adminNotes });
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {survey.overallRating < 3.5 && (
                        <Button size="sm" variant="outline" className="text-orange-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Flag for Follow-up
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Survey Alerts
              </CardTitle>
              <CardDescription>
                Automated alerts for surveys requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{alert.alertType}</h3>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(alert.createdAt), "PPP")}
                        </p>
                      </div>
                      <Badge 
                        variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p>No active alerts. All surveys are within normal parameters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Survey Analytics
              </CardTitle>
              <CardDescription>
                {loadingAnalytics ? "Loading analytics..." : "Performance insights and trends"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4">Average Ratings by Category</h3>
                      <div className="space-y-3">
                        {[
                          { label: "Overall", value: analytics.averageOverallRating },
                          { label: "Check-in", value: analytics.averageCheckInRating },
                          { label: "Cleanliness", value: analytics.averageCleanlinessRating },
                          { label: "Property", value: analytics.averagePropertyRating },
                          { label: "Location", value: analytics.averageLocationRating },
                          { label: "Team", value: analytics.averageTeamRating },
                          { label: "Communication", value: analytics.averageCommunicationRating }
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="text-sm">{label}:</span>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= value
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">
                                {value?.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4">Response Distribution</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Excellent (5 stars):</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {analytics.responseDistribution?.excellent || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Good (4 stars):</span>
                          <Badge variant="secondary">
                            {analytics.responseDistribution?.good || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Average (3 stars):</span>
                          <Badge variant="secondary">
                            {analytics.responseDistribution?.average || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Poor (1-2 stars):</span>
                          <Badge variant="destructive">
                            {analytics.responseDistribution?.poor || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>No analytics data available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Survey Form</CardTitle>
              <CardDescription>
                Use this form to test the guest survey experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GuestSurveyForm
                onSubmit={(data) => createSurveyMutation.mutate(data)}
                isLoading={createSurveyMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}