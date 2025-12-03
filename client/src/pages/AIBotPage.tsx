import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIBotChat } from '@/components/AIBotChat';
import { Bot, Zap, Database, Shield } from 'lucide-react';

export function AIBotPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-500" />
          Captain Cortex AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Ask questions about your properties, tasks, revenue, expenses, and bookings. 
          Captain Cortex is the Smart Co-Pilot for Property Management with real-time access to all your data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Chat Interface */}
        <div className="lg:col-span-2">
          <AIBotChat />
        </div>

        {/* Information Cards */}
        <div className="space-y-4">
          {/* Capabilities Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">What MR Pilot can help with:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Task scheduling and tracking</li>
                  <li>• Revenue and expense analysis</li>
                  <li>• Property performance insights</li>
                  <li>• Booking status and availability</li>
                  <li>• Financial reporting</li>
                  <li>• Maintenance scheduling</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Access Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Live Data Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Connected to:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All property records</li>
                  <li>• Task management system</li>
                  <li>• Booking calendar</li>
                  <li>• Financial transactions</li>
                  <li>• Expense tracking</li>
                  <li>• Revenue reporting</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Data Protection:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Organization-level data isolation</li>
                  <li>• Role-based access control</li>
                  <li>• Encrypted API communication</li>
                  <li>• No data stored by AI provider</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Example Questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Example Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-muted rounded text-sm">
                  "What tasks do we have for tomorrow?"
                </div>
                <div className="p-2 bg-muted rounded text-sm">
                  "Show me revenue from Villa Tropical Paradise in March"
                </div>
                <div className="p-2 bg-muted rounded text-sm">
                  "What were the electric charges for Villa Aruna in May?"
                </div>
                <div className="p-2 bg-muted rounded text-sm">
                  "Which properties have bookings this week?"
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}