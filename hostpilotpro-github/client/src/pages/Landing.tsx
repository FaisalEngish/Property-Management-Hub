import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, LogIn, User, Building } from "lucide-react";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Fetch demo users for quick login
  const { data: demoUsers = [] } = useQuery({
    queryKey: ["/api/auth/demo-users"],
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/demo-login", credentials);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Login successful",
        description: `Welcome! Redirecting to your ${data.user?.role} dashboard...`,
      });
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/dashboard";
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleDemoLogin = (demoUser: any) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    loginMutation.mutate({ email: demoUser.email, password: demoUser.password });
  };

  const copyCredentials = (demoUser: any) => {
    navigator.clipboard.writeText(`${demoUser.email} / ${demoUser.password}`);
    toast({
      title: "Copied to clipboard",
      description: `${demoUser.email} / ${demoUser.password}`,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      "portfolio-manager": "bg-blue-100 text-blue-800",
      owner: "bg-green-100 text-green-800",
      staff: "bg-yellow-100 text-yellow-800",
      "retail-agent": "bg-purple-100 text-purple-800",
      "referral-agent": "bg-indigo-100 text-indigo-800",
      guest: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building className="h-10 w-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900">
              HostPilotPro
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete property management platform for hospitality professionals.
            Manage properties, track tasks, handle bookings, and monitor finances.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Login Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Login to HostPilotPro
              </CardTitle>
              <CardDescription>
                Enter your credentials or use a demo account below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hostpilotpro.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Users */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Demo Accounts
              </CardTitle>
              <CardDescription>
                Click any account to login instantly, or copy credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoUsers.map((user: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {user.email} / {user.password}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCredentials(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDemoLogin(user)}
                        disabled={loginMutation.isPending}
                        className="text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        Login
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track properties, owners, and status updates with real-time management tools.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agent Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Referral and retail agent portals with commission tracking and booking management.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Toolkit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Revenue tracking, expense monitoring, and automated invoice generation.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Multi-tenant ready • Role-based access • Real-time updates
          </Badge>
        </div>
      </div>
    </div>
  );
}