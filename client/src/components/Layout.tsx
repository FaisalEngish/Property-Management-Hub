import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import TopBar from "@/components/TopBar";

interface LayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Layout({ children, className, title, subtitle, action }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    const handleSidebarCollapse = (e: any) => {
      setSidebarCollapsed(e.detail.isCollapsed);
    };
    window.addEventListener('sidebarCollapse', handleSidebarCollapse);
    return () => window.removeEventListener('sidebarCollapse', handleSidebarCollapse);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content - Sidebar is in App.tsx */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        {/* Mobile top spacing */}
        <div className="lg:hidden h-20"></div>
        
        {/* TopBar */}
        {title && <TopBar title={title} subtitle={subtitle} action={action} />}
        
        {/* Page Content */}
        <main className={cn("p-4 lg:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}