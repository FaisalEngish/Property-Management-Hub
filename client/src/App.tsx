import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";

// Import existing pages
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Tasks from "@/pages/Tasks";
import Bookings from "@/pages/Bookings";
import Services from "@/pages/Services";
import Finances from "@/pages/Finances";
import Settings from "@/pages/Settings";
import LoginPage from "@/pages/LoginPage";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import FilteredFinancialDashboard from "@/pages/FilteredFinancialDashboard";
import FilteredPropertyDashboard from "@/pages/FilteredPropertyDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (!response.ok) {
          if (response.status >= 500) {
            throw new Error(`Server error: ${response.status}`);
          }
          if (response.status === 404) {
            throw new Error(`Not found: ${queryKey[0]}`);
          }
          if (response.status === 401) {
            throw new Error(`401: Unauthorized`);
          }
          throw new Error(`Request failed: ${response.status}`);
        }
        
        return response.json();
      },
      retry: (failureCount, error) => {
        if (error.message.includes('401: Unauthorized')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, show login page
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // User is authenticated, show the main app
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/properties" component={Properties} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/services" component={Services} />
        <Route path="/finances" component={Finances} />
        <Route path="/filtered-financial-dashboard" component={FilteredFinancialDashboard} />
        <Route path="/filtered-property-dashboard" component={FilteredPropertyDashboard} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRoutes />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}