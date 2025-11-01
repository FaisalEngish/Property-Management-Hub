import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content - Sidebar is in App.tsx */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Mobile top spacing */}
        <div className="lg:hidden h-20"></div>
        
        {/* Page Content */}
        <main className={cn("p-4 lg:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}