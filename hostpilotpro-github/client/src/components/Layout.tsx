import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="lg:pl-80">
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