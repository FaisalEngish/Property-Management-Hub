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

export default function Layout({
  children,
  className,
  title,
  subtitle,
  action,
}: LayoutProps) {
  return (
    <div className="bg-background flex-1 flex flex-col">
      {/* Mobile top spacing */}
      <div className="lg:hidden h-20"></div>

      {/* TopBar - sticky at top */}
      {title && (
        <div className="sticky top-0 z-50">
          <TopBar title={title} subtitle={subtitle} action={action} />
        </div>
      )}

      {/* Page Content */}
      <main className={cn("p-4 lg:p-6", className)}>{children}</main>
    </div>
  );
}
