import { ReactNode } from "react";
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
  return (
    <div className="min-h-screen bg-background flex-1 flex flex-col overflow-x-hidden">
      {/* Mobile top spacing */}
      <div className="lg:hidden h-20"></div>
      
      {/* TopBar */}
      {title && <TopBar title={title} subtitle={subtitle} action={action} />}
      
      {/* Page Content */}
      <main className={cn("p-4 lg:p-6 flex-1", className)}>
        {children}
      </main>
    </div>
  );
}