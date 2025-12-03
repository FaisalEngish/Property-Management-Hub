import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  DollarSign,
  Building2,
  CheckSquare,
  TrendingUp,
  Activity,
  Home,
  Search,
} from "lucide-react";

export default function DashboardHub() {
  const [searchTerm, setSearchTerm] = useState("");

  const dashboardItems = useMemo(
    () => [
      {
        title: "Admin Dashboard",
        emoji: "📊",
        description:
          "Comprehensive overview of all properties, bookings, tasks, and financial metrics",
        href: "/",
        icon: BarChart3,
        badge: "Main",
        color: "bg-emerald-50/50 hover:bg-emerald-100/70 border-emerald-200/60",
        keywords: ["admin", "overview", "main", "dashboard", "analytics"],
      },
      {
        title: "Financial Dashboard",
        emoji: "💰",
        description:
          "Revenue tracking, expense analysis, and financial performance insights",
        href: "/finance-hub",
        icon: DollarSign,
        badge: "Finance",
        color: "bg-teal-50/50 hover:bg-teal-100/70 border-teal-200/60",
        keywords: ["finance", "revenue", "money", "financial", "analytics"],
      },
      {
        title: "Property Dashboard",
        emoji: "🏢",
        description:
          "Property-specific metrics, occupancy rates, and performance analytics",
        href: "/property-hub",
        icon: Building2,
        badge: "Properties",
        color: "bg-cyan-50/50 hover:bg-cyan-100/70 border-cyan-200/60",
        keywords: ["property", "building", "occupancy", "real estate"],
      },
      {
        title: "Task Overview",
        emoji: "✅",
        description:
          "Global task monitoring across all properties with staff performance tracking",
        href: "/tasks",
        icon: CheckSquare,
        badge: "Operations",
        color: "bg-green-50/50 hover:bg-green-100/70 border-green-200/60",
        keywords: ["tasks", "operations", "staff", "monitoring", "workflow"],
      },
      {
        title: "Daily Operations",
        emoji: "⚡",
        description:
          "Today's activities, urgent tasks, and operational status overview",
        href: "/daily-operations",
        icon: Activity,
        badge: "Today",
        color: "bg-slate-50/50 hover:bg-slate-100/70 border-slate-200/60",
        keywords: ["daily", "today", "urgent", "activities", "operations"],
      },
      {
        title: "Portfolio Manager Dashboard",
        emoji: "📈",
        description: "Multi-property portfolio insights and management tools",
        href: "/portfolio-manager-dashboard",
        icon: TrendingUp,
        badge: "Portfolio",
        color: "bg-emerald-50/50 hover:bg-emerald-100/70 border-emerald-200/60",
        keywords: ["portfolio", "manager", "insights", "analytics", "trends"],
      },
    ],
    [],
  );

  // Filter dashboard items based on search term
  const filteredItems = dashboardItems.filter((item) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.badge.toLowerCase().includes(searchLower) ||
      item.keywords.some((keyword) => keyword.includes(searchLower))
    );
  });

  const today = new Date().toLocaleDateString();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-3">
      <div className="mb-6 sm:mb-8">
        <TopBar
          title="Dashboard Hub"
          subtitle="Access all dashboard views and analytics from one central location"
        />

        <h1 className="text-3xl sm:text-4xl md:text-5xl mt-2 font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Dashboard Hub
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 sm:mt-3 text-base sm:text-lg font-medium tracking-wide">
          Access all dashboard views and analytics from one central location
        </p>
      </div>

      {/* Search/Filter Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="relative max-w-xl sm:max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search dashboards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200/60 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 shadow-sm hover:shadow-md bg-white/80 backdrop-blur-sm w-full"
            aria-label="Search dashboards"
          />
        </div>
      </div>

      {/* Grid of dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 text-lg font-medium">
              No dashboards found matching "{searchTerm}"
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const IconComponent = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`block h-full no-underline rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${item.color}`}
                  aria-label={`Open ${item.title}`}
                >
                  <Card className="h-full cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] border-2 shadow-lg bg-gradient-to-br from-emerald-50/30 to-white rounded-2xl">
                    <CardHeader className="pb-4 pt-6 px-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20 flex-shrink-0">
                            <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-700" />
                          </div> */}
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className="text-xl sm:text-2xl flex-shrink-0">
                              {item.emoji}
                            </span>
                            <CardTitle className="text-base sm:text-lg md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight whitespace-normal break-words">
                              {item.title}
                            </CardTitle>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-md px-2 py-0.5 font-semibold text-xs flex-shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 flex-1">
                      <p className="text-sm sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            );
          })
        )}
      </div>

      {/* Enhanced Footer Section with Version */}
      <div className="mt-10 sm:mt-12 pt-6 border-t border-slate-200/50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-slate-400 font-medium">
          <span>Last updated: {today}</span>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-semibold">
            v2.0.1
          </span>
        </div>
      </div>
    </div>
  );
}
