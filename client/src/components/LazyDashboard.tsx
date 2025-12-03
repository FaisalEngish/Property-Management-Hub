import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lazy load heavy dashboard components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SimpleFilteredFinancialDashboard = lazy(() => import("@/pages/SimpleFilteredFinancialDashboard"));
const FilteredPropertyDashboard = lazy(() => import("@/pages/FilteredPropertyDashboard"));

// Loading component
function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LazyDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

export function LazyFinancialDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SimpleFilteredFinancialDashboard />
    </Suspense>
  );
}

export function LazyPropertyDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <FilteredPropertyDashboard />
    </Suspense>
  );
}