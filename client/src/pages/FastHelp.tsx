import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Globe,
  FileText,
  HelpCircle,
  Users,
  Zap,
  ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";

export default function FastHelp() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation("/")}
          className="mb-4"
          data-testid="button-back-dashboard"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground">
          Get quick assistance with HostPilotPro - Your property management platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Immediate assistance available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+66 (0) 76-123-456</p>
                <Badge className="text-xs">24/7 Available</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@hostpilotpro.com</p>
                <Badge variant="secondary" className="text-xs">Response within 2 hours</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <div>
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">Available in-app</p>
                <Badge variant="outline" className="text-xs">Online now</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Fast solutions for common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Live Chat Support
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View User Guide
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Knowledge Base
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Training Videos
            </Button>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Common Solutions
            </CardTitle>
            <CardDescription>
              Quick fixes for frequent questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold">Property Management</h4>
                <div className="space-y-2 text-sm">
                  <p>• <strong>Adding Properties:</strong> Go to Property Hub → Add New Property</p>
                  <p>• <strong>Task Assignment:</strong> Use Daily Operations → Create Task</p>
                  <p>• <strong>Booking Management:</strong> Access via Bookings tab</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Financial Tools</h4>
                <div className="space-y-2 text-sm">
                  <p>• <strong>Invoice Generation:</strong> Finance Hub → Invoice Generator</p>
                  <p>• <strong>Revenue Reports:</strong> Admin Dashboard → Financial Reports</p>
                  <p>• <strong>Commission Tracking:</strong> Finance Engine → Commission System</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">User Management</h4>
                <div className="space-y-2 text-sm">
                  <p>• <strong>Add Users:</strong> Admin → User Management → Add User</p>
                  <p>• <strong>Permissions:</strong> Click Permissions button next to any user</p>
                  <p>• <strong>Role Changes:</strong> Edit user profile and update role</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">AI Assistant</h4>
                <div className="space-y-2 text-sm">
                  <p>• <strong>Captain Cortex:</strong> Click the AI button in bottom-right corner</p>
                  <p>• <strong>Smart Queries:</strong> Ask about properties, revenue, or tasks</p>
                  <p>• <strong>Report Generation:</strong> Request automated insights</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>System Status</span>
              <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Response</span>
              <Badge variant="outline">&lt; 50ms average</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Update</span>
              <span className="text-sm text-muted-foreground">Today, 2:30 PM</span>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Phone className="h-5 w-5" />
              Emergency Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="font-medium text-red-800">24/7 Emergency Hotline</p>
              <p className="text-lg font-bold text-red-900">+66 (0) 76-999-888</p>
              <p className="text-xs text-red-700">For critical system issues or property emergencies</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800">Technical Support</p>
              <p className="text-lg font-bold text-blue-900">+66 (0) 76-888-777</p>
              <p className="text-xs text-blue-700">For urgent technical assistance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}