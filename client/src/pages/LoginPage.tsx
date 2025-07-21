import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, Shield, Users, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

const DEMO_CREDENTIALS = [
  { email: "admin@demo.com", role: "Admin", password: "123456", permissions: "Full system access, User management, God Mode" },
  { email: "manager@demo.com", role: "Portfolio Manager", password: "123456", permissions: "Property management, Financial oversight" },
  { email: "owner@demo.com", role: "Property Owner", password: "123456", permissions: "Own properties, Financial reports" },
  { email: "staff@demo.com", role: "Staff Member", password: "123456", permissions: "Task management, Property operations" },
  { email: "retail@demo.com", role: "Retail Agent", password: "123456", permissions: "Booking management, Commission tracking" },
  { email: "referral@demo.com", role: "Referral Agent", password: "123456", permissions: "Property referrals, Commission tracking" },
  { email: "guest@demo.com", role: "Guest", password: "123456", permissions: "Guest portal, Service requests" }
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (user && !authLoading) {
    // Use useEffect to avoid setting location during render
    React.useEffect(() => {
      setLocation("/");
    }, [setLocation]);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("123456");
    setIsLoading(true);
    setError("");

    try {
      await login(demoEmail, "123456");
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Hero Section */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              HostPilotPro
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Complete Hospitality Management Platform
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Property Management</h3>
                <p className="text-gray-600 dark:text-gray-300">Comprehensive property oversight with intelligent automation</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Multi-Role Access</h3>
                <p className="text-gray-600 dark:text-gray-300">Role-based permissions for admins, managers, owners, staff, and agents</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Secure Platform</h3>
                <p className="text-gray-600 dark:text-gray-300">Enterprise-grade security with encrypted sessions and audit trails</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Sign in to your HostPilotPro account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Demo Accounts</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_CREDENTIALS.slice(0, 4).map((demo) => (
                    <Button
                      key={demo.email}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin(demo.email)}
                      disabled={isLoading}
                      className="justify-start text-left"
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{demo.role}</span>
                        <span className="text-xs text-gray-500 truncate">{demo.email}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_CREDENTIALS.slice(4).map((demo) => (
                    <Button
                      key={demo.email}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin(demo.email)}
                      disabled={isLoading}
                      className="justify-start text-left"
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{demo.role}</span>
                        <span className="text-xs text-gray-500 truncate">{demo.email}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  All demo accounts use password: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">123456</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}