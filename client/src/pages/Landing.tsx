import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, ListTodo, DollarSign, Users, Shield } from "lucide-react";

export default function Landing() {
  console.log("HostPilotPro: Landing page is rendering");
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">HostPilotPro</h1>
          </div>
          <Button onClick={() => window.location.href = '/api/login'} className="bg-primary hover:bg-primary/90">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Comprehensive Hospitality
            <span className="text-primary block">Management Platform</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your property management with smart automation, role-based access, 
            and integrated booking systems designed for hospitality professionals.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'} 
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
            size="lg"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Manage Your Properties
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Building className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Property Management</CardTitle>
                <CardDescription>
                  Comprehensive property tracking with amenities, pricing, and availability management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Live Booking Calendar</CardTitle>
                <CardDescription>
                  Real-time booking management with Hostaway integration and automated workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ListTodo className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Task Automation</CardTitle>
                <CardDescription>
                  Intelligent task assignment for cleaning, maintenance, and guest services.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Financial Tracking</CardTitle>
                <CardDescription>
                  Complete financial oversight with commissions, expenses, and revenue analytics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Granular permissions for admins, managers, owners, staff, and agents.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure & Scalable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with modular architecture for growth.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Property Management?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hospitality professionals who trust HostPilotPro to streamline their operations.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'} 
            className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
            size="lg"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building className="h-6 w-6" />
            <span className="text-lg font-semibold">HostPilotPro</span>
          </div>
          <p className="text-gray-400">
            © 2024 HostPilotPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
