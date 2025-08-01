import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Zap
} from "lucide-react";

export default function Help() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground">
          Get in touch with our support team for assistance with HostPilotPro
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Reach out to our support team directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@hostpilotpro.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Office Address</p>
                <p className="text-sm text-muted-foreground">
                  123 Business Avenue<br />
                  Suite 456<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Support Hours
            </CardTitle>
            <CardDescription>
              When our team is available to help
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Monday - Friday</span>
                <span className="text-sm text-muted-foreground">9:00 AM - 6:00 PM PST</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Saturday</span>
                <span className="text-sm text-muted-foreground">10:00 AM - 4:00 PM PST</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sunday</span>
                <span className="text-sm text-muted-foreground">Closed</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                24/7 Emergency Support
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Critical issues affecting property operations are handled 24/7
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Fast ways to get help
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Live Chat
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email Ticket
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Schedule Call Back
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Visit Knowledge Base
            </Button>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>
              Additional help and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">User Guide</p>
                <p className="text-sm text-muted-foreground">Complete platform documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Community Forum</p>
                <p className="text-sm text-muted-foreground">Connect with other users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Video Tutorials</p>
                <p className="text-sm text-muted-foreground">Step-by-step video guides</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contact */}
      <Card className="mt-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Zap className="h-5 w-5" />
            Emergency Support
          </CardTitle>
          <CardDescription className="text-red-700">
            For urgent issues affecting property operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-800">Emergency Hotline</p>
              <p className="text-sm text-red-700">Available 24/7 for critical issues</p>
            </div>
            <Button variant="destructive">
              <Phone className="h-4 w-4 mr-2" />
              Call +1 (555) 911-HELP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current platform status and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">All Systems Operational</span>
            </div>
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              View Status Page
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: 2 minutes ago
          </p>
        </CardContent>
      </Card>
    </div>
  );
}