import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  ExternalLink,
  Video,
  FileText,
  Users,
  Home,
  Calendar,
  DollarSign,
  Settings,
  CheckSquare,
  Phone,
  Mail,
  Clock,
  ArrowRight
} from "lucide-react";

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  readTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const helpArticles: HelpArticle[] = [
    {
      id: "1",
      title: "Getting Started with HostPilotPro",
      description: "Learn the basics of property management and initial setup",
      category: "Getting Started",
      tags: ["setup", "basics", "onboarding"],
      readTime: "5 min",
      difficulty: "beginner"
    },
    {
      id: "2", 
      title: "Managing Properties and Bookings",
      description: "Complete guide to property setup and booking management",
      category: "Properties",
      tags: ["properties", "bookings", "calendar"],
      readTime: "8 min",
      difficulty: "beginner"
    },
    {
      id: "3",
      title: "Finance Intelligence Module",
      description: "AI-powered financial analysis and business insights",
      category: "Finance",
      tags: ["finance", "ai", "analytics", "reports"],
      readTime: "12 min",
      difficulty: "intermediate"
    },
    {
      id: "4",
      title: "Staff Management & Payroll",
      description: "Manage staff salaries, wages, and payroll information",
      category: "Staff",
      tags: ["staff", "payroll", "salaries", "admin"],
      readTime: "10 min",
      difficulty: "intermediate"
    },
    {
      id: "5",
      title: "Task Automation and Scheduling",
      description: "Set up automatic task creation and scheduling rules",
      category: "Tasks",
      tags: ["tasks", "automation", "scheduling"],
      readTime: "15 min",
      difficulty: "advanced"
    },
    {
      id: "6",
      title: "User Roles and Permissions",
      description: "Configure user access levels and module permissions",
      category: "Administration",
      tags: ["users", "permissions", "roles", "security"],
      readTime: "7 min",
      difficulty: "intermediate"
    }
  ];

  const faqItems: FAQItem[] = [
    {
      question: "How do I reset a user's password?",
      answer: "Navigate to User Management, select the user, and click 'Reset Password'. An email will be sent to the user with reset instructions.",
      category: "User Management"
    },
    {
      question: "Can I export financial reports?",
      answer: "Yes! Go to Finance Hub → Finance Intelligence and click 'Export Report' to download PDF or CSV reports with AI insights.",
      category: "Finance"
    },
    {
      question: "How do I set up automated tasks?",
      answer: "Go to Task Management → Automation Rules to create recurring tasks based on property events, dates, or booking triggers.",
      category: "Tasks"
    },
    {
      question: "What's the difference between Admin and Portfolio Manager roles?",
      answer: "Admins have full system access including user management and system settings. Portfolio Managers can manage properties and view reports but cannot access admin-only features.",
      category: "Roles"
    },
    {
      question: "How do I add a new property?",
      answer: "Navigate to Property Management and click 'Add Property'. Fill in the required details including address, amenities, and owner information.",
      category: "Properties"
    },
    {
      question: "Can I integrate with external booking platforms?",
      answer: "Yes, HostPilotPro supports integrations with Airbnb, Booking.com, and VRBO through our API connections panel in Settings.",
      category: "Integrations"
    }
  ];

  const quickActions = [
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: Video,
      action: () => window.open("https://youtube.com/@hostpilotpro", "_blank")
    },
    {
      title: "Contact Support",
      description: "Get help from our team",
      icon: MessageCircle,
      action: () => window.open("mailto:support@hostpilotpro.com", "_blank")
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: Users,
      action: () => window.open("https://community.hostpilotpro.com", "_blank")
    },
    {
      title: "System Status",
      description: "Check service availability",
      icon: CheckSquare,
      action: () => window.open("https://status.hostpilotpro.com", "_blank")
    }
  ];

  const filteredArticles = helpArticles.filter(article =>
    searchQuery === "" || 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFAQs = faqItems.filter(faq =>
    searchQuery === "" ||
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Properties': return Home;
      case 'Finance': return DollarSign;
      case 'Tasks': return CheckSquare;
      case 'Staff': return Users;
      case 'Administration': return Settings;
      default: return FileText;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <HelpCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Help Center</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Find answers, guides, and resources to help you get the most out of HostPilotPro
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search help articles and FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
            <CardContent className="p-4 text-center">
              <action.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
              <ExternalLink className="h-3 w-3 mx-auto mt-2 text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles">Help Articles</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <div className="grid gap-4">
            {filteredArticles.map((article) => {
              const CategoryIcon = getCategoryIcon(article.category);
              return (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-blue-50">
                          <CategoryIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{article.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                            <Badge className={`text-xs ${getDifficultyColor(article.difficulty)}`}>
                              {article.difficulty}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{article.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {article.readTime}
                            </div>
                            <div className="flex gap-1">
                              {article.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="grid gap-4">
            {filteredFAQs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  <Badge variant="outline" className="mt-3 text-xs">
                    {faq.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Section */}
      <Card className="mt-8 bg-blue-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.open("mailto:support@hostpilotpro.com", "_blank")}>
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </Button>
            <Button variant="outline" onClick={() => window.open("tel:+1-555-HOSTPRO", "_blank")}>
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}