import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, DollarSign, Building } from "lucide-react";
import { useLocation } from "wouter";
import TopBar from "@/components/TopBar";
import EnhancedFinanceDashboard from "@/components/EnhancedFinanceDashboard";

export default function EnhancedFinances() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Enhanced Finance Analytics" />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/finance')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Finance Hub
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Enhanced Financial Analytics</h1>
              <p className="text-muted-foreground">
                Advanced revenue and payout analysis with detailed filtering capabilities
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Enhanced Analytics
          </Badge>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Multi-Dimensional Filtering</h3>
                  <p className="text-sm text-muted-foreground">
                    Filter by property, department, cost center, date ranges, and more
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Department Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed breakdown by departments and business units
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold">Revenue Channel Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze performance across booking channels and revenue streams
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <EnhancedFinanceDashboard />
      </main>
    </div>
  );
}