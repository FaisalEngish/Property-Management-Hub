import { useEffect } from 'react';
import { Link } from 'wouter';
import { queryClient } from '../lib/queryClient';

interface InstantHubLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Instant hub navigation component that preloads on hover and click
export function InstantHubLink({ href, children, className, onClick }: InstantHubLinkProps) {
  const preloadRoute = () => {
    // Pre-cache the route for instant navigation
    queryClient.prefetchQuery({
      queryKey: ['route', href],
      queryFn: () => Promise.resolve(true),
      staleTime: 60 * 60 * 1000, // 1 hour
    });

    // Pre-load hub-specific data based on route
    if (href.includes('property-hub')) {
      queryClient.prefetchQuery({
        queryKey: ['/api/properties/fast'],
        staleTime: 60 * 60 * 1000,
      });
    } else if (href.includes('finance-hub')) {
      queryClient.prefetchQuery({
        queryKey: ['/api/finance/fast'],
        staleTime: 60 * 60 * 1000,
      });
    } else if (href.includes('dashboard-hub')) {
      queryClient.prefetchQuery({
        queryKey: ['/api/dashboard/stats/fast'],
        staleTime: 60 * 60 * 1000,
      });
    }
  };

  const handleClick = () => {
    console.log('Sidebar link clicked:', href);
    preloadRoute();
    onClick?.();
  };

  return (
    <Link 
      href={href} 
      className={className}
      onMouseEnter={preloadRoute} // Pre-load on hover
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

// Pre-load all hub data on app start
export function PreloadHubData() {
  useEffect(() => {
    const hubEndpoints = [
      '/api/hub/dashboard/fast',
      '/api/hub/property/fast', 
      '/api/hub/finance/fast',
      '/api/hub/system/fast'
    ];

    // Pre-cache all hub endpoints
    hubEndpoints.forEach(endpoint => {
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 60 * 60 * 1000,
      });
    });
  }, []);

  return null;
}