import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogIn, Shield, Users, Home, Building2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "admin@test.com", password: "admin123", role: "Admin", color: "bg-red-100 text-red-800", icon: Shield },
  { email: "manager@test.com", password: "manager123", role: "Portfolio Manager", color: "bg-blue-100 text-blue-800", icon: Building2 },
  { email: "owner@test.com", password: "owner123", role: "Property Owner", color: "bg-green-100 text-green-800", icon: Home },
  { email: "staff@test.com", password: "staff123", role: "Staff", color: "bg-purple-100 text-purple-800", icon: Users },
  { email: "referral@demo.com", password: "123456", role: "Referral Agent", color: "bg-orange-100 text-orange-800", icon: Users }
];

export default function QuickLoginFix() {
  const [loading, setLoading] = useState<string | null>(null);

  const quickLogin = async (email: string, password: string) => {
    setLoading(email);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Direct redirect to dashboard
        window.location.href = data.redirectUrl || '/';
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Quick Login Fix
          </CardTitle>
          <CardDescription>
            Your authentication system is restored!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            return (
              <Button
                key={account.email}
                variant="outline"
                className="w-full justify-start"
                onClick={() => quickLogin(account.email, account.password)}
                disabled={loading === account.email}
              >
                <Icon className="h-4 w-4 mr-2" />
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{account.role}</span>
                    <Badge className={`text-xs ${account.color} border-0`}>
                      {account.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{account.email}</p>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}