import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Shield, 
  Brain, 
  ExternalLink
} from "lucide-react";

const AdditionalSettings = () => {
  const settingsItems = [
    {
      title: "Activity Logs",
      description: "View system activity logs and user actions",
      icon: Activity,
      href: "/admin/activity-log",
      badge: null
    },
    {
      title: "Finance Reset",
      description: "Administrative finance system reset controls",
      icon: Shield,
      href: "/admin/finance-reset",
      badge: null
    },
    {
      title: "AI Notifications & Reminders",
      description: "Configure AI-powered notifications and reminder systems",
      icon: Brain,
      href: "/ai-notifications-reminders",
      badge: "New"
    },
    {
      title: "Sandbox Testing",
      description: "Quality assurance testing environment",
      icon: Activity,
      href: "/sandbox-testing",
      badge: "QA"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Additional Settings</h1>
        <p className="text-muted-foreground">
          Administrative tools and advanced configuration options
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {settingsItems.map((item, index) => {
          const IconComponent = item.icon;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {item.title}
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
                <Link href={item.href}>
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open {item.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>These settings require administrative privileges</span>
        </div>
      </div>
    </div>
  );
};

export default AdditionalSettings;