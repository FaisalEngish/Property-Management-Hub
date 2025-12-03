import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Loader2 } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface LazyChartProps {
  title: string;
  description?: string;
  endpoint: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
  className?: string;
  onDataLoad?: (data: any) => void;
  renderChart?: (data: any, isLoading: boolean) => React.ReactNode;
}

export default function LazyChart({
  title,
  description,
  endpoint,
  chartType = 'line',
  height = 300,
  className = "",
  onDataLoad,
  renderChart
}: LazyChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for visibility detection
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !data && !isLoading) {
          setIsVisible(true);
          loadChartData();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [data, isLoading]);

  const loadChartData = async () => {
    if (isLoading || data) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(endpoint, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const chartData = await response.json();
      setData(chartData);
      onDataLoad?.(chartData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data';
      setError(errorMessage);
      console.error(`Chart data error (${endpoint}):`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLoad = () => {
    setData(null);
    loadChartData();
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'bar': return <BarChart3 className="h-5 w-5" />;
      case 'line': return <TrendingUp className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <Card ref={cardRef} className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {(data || error) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualLoad}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div style={{ height: `${height}px` }} className="w-full">
          {!isVisible && !data ? (
            // Placeholder before chart becomes visible
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chart will load when visible</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualLoad}
                  className="mt-2"
                >
                  Load Now
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            // Loading state
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-gray-600 mt-2">Loading chart data...</p>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="flex items-center justify-center h-full bg-red-50 rounded-lg border-2 border-red-200">
              <div className="text-center">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualLoad}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : data && renderChart ? (
            // Custom chart renderer
            renderChart(data, false)
          ) : data ? (
            // Default data display
            <div className="flex items-center justify-center h-full bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-center">
                <div className="text-green-500 mb-2">📊</div>
                <p className="text-sm text-green-600">Chart data loaded successfully</p>
                <p className="text-xs text-gray-500 mt-1">
                  {JSON.stringify(data).length} bytes of data
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}