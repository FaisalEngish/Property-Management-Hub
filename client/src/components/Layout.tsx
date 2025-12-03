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
    <div className="bg-background flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Mobile top spacing for sidebar menu button */}
      <div className="md:hidden h-16"></div>

      {/* TopBar - sticky at top */}
      {title && (
        <div className="sticky top-0 z-40">
          <TopBar title={title} subtitle={subtitle} action={action} />
        </div>
      )}

      {/* Page Content - responsive padding */}
      <main className={cn(
        "p-3 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden",
        className
      )}>
        {children}
      </main>
    </div>
  );
}
