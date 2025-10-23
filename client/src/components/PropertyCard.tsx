import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Wrench, 
  Users,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface PropertyCardProps {
  property: any;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onViewDetails: () => void;
  onDelete?: () => void;
  expiryStatus?: 'expiring' | 'expired' | null;
}

export function PropertyCard({ property, isSelected, onSelect, onViewDetails, onDelete, expiryStatus }: PropertyCardProps) {
  const [, navigate] = useLocation();
  
  const formatCurrency = (amount: number) => {
    return `฿${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No bookings yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate KPIs - Initialize with 0 or null, not random values
  const occupancyRate = property.occupancyRate || 0;
  const monthlyRevenue = property.monthlyRevenue || 0;
  const maintenanceCosts = property.maintenanceCosts || 0;
  const maintenanceRatio = monthlyRevenue > 0 ? ((maintenanceCosts / monthlyRevenue) * 100).toFixed(1) : '0.0';
  const lastBookingDate = property.lastBookingDate || null;
  const roi = property.roi || 0;
  
  // Priority maintenance tasks - Initialize with 0, not random values
  const maintenanceTasks = property.maintenanceTasks || 0;
  const urgentTasks = Math.floor(maintenanceTasks * 0.3);

  // Smart Analytics Tags
  const getAnalyticsTags = () => {
    const tags = [];
    
    // Expiry Status (highest priority - show first)
    if (expiryStatus === 'expired') {
      tags.push({ label: 'Document Expired', color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴' });
    } else if (expiryStatus === 'expiring') {
      tags.push({ label: 'Expiring Soon', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🟠' });
    }
    
    // High ROI (>15%)
    if (parseFloat(roi) > 15) {
      tags.push({ label: 'High ROI', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: '📈' });
    }
    
    // Low Occupancy (<70%)
    if (occupancyRate < 70) {
      tags.push({ label: 'Low Occupancy', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '📊' });
    }
    
    // Urgent Maintenance (>3 tasks)
    if (maintenanceTasks > 3) {
      tags.push({ label: 'Urgent Maintenance', color: 'bg-red-100 text-red-700 border-red-300', icon: '🚨' });
    }
    
    // Premium Property (high revenue)
    if (monthlyRevenue > 120000) {
      tags.push({ label: 'Premium', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '⭐' });
    }
    
    return tags.slice(0, 2); // Show max 2 tags to avoid clutter
  };
  
  const analyticsTags = getAnalyticsTags();

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  return (
    <Card className="group hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-300 relative bg-white/90 backdrop-blur-sm border border-slate-200/50">
      <div className="absolute top-4 left-4 z-10">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onSelect}
          className="bg-white/90 border-2 border-emerald-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
        />
      </div>
      
      {/* Quick Action Buttons - Appear on Hover */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-emerald-50 hover:scale-110 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/property/${property.id}/edit`);
          }}
          title="Edit Property"
        >
          ✏️
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-emerald-50 hover:scale-110 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/bookings');
          }}
          title="View Calendar"
        >
          📅
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-emerald-50 hover:scale-110 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/finance-hub?property=${property.id}`);
          }}
          title="View Reports"
        >
          🧾
        </Button>
      </div>
      
      {/* Analytics Tags */}
      {analyticsTags.length > 0 && (
        <div className="absolute top-16 left-4 z-10 flex flex-col gap-1">
          {analyticsTags.map((tag, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className={`${tag.color} text-xs font-medium px-2 py-1 rounded-full shadow-sm animate-pulse`}
            >
              {tag.icon} {tag.label}
            </Badge>
          ))}
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between pl-8">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-2xl shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-teal-200/20"></div>
              <div className="relative text-3xl">
                {property.name?.toLowerCase().includes('beach') || property.name?.toLowerCase().includes('ocean') ? '🏖️' :
                 property.name?.toLowerCase().includes('villa') ? '🏡' :
                 property.name?.toLowerCase().includes('tropical') || property.name?.toLowerCase().includes('paradise') ? '🌴' :
                 property.name?.toLowerCase().includes('samui') ? '🏝️' : '🏠'}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle className="text-lg font-bold text-slate-800">{property.name}</CardTitle>
                <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  property.status?.toLowerCase() === 'active' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                    : property.status?.toLowerCase() === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                }`}>
                  {property.status || 'Active'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-3 w-3" />
                {property.address || 'Bangkok, Thailand'}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Details */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-semibold">{property.bedrooms || 3}</div>
            <div className="text-xs text-slate-600">Bedrooms</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-semibold">{property.bathrooms || 2}</div>
            <div className="text-xs text-slate-600">Bathrooms</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-semibold">{property.capacity || 6}</div>
            <div className="text-xs text-slate-600">Guests</div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Last Booking</span>
            <span className="text-sm font-medium">{formatDate(lastBookingDate)}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Occupancy Rate</span>
              <span className="text-sm font-bold text-emerald-600">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Monthly Revenue</span>
            <span className="text-sm font-bold text-emerald-700">
              {formatCurrency(monthlyRevenue)}
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" 
              style={{ width: `${Math.min((monthlyRevenue / 200000) * 100, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Maintenance/Revenue</span>
            <span className={`text-sm font-medium ${
              parseFloat(maintenanceRatio) > 15 ? 'text-red-600' : 
              parseFloat(maintenanceRatio) > 10 ? 'text-yellow-600' : 'text-emerald-600'
            }`}>
              {maintenanceRatio}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">ROI</span>
            <span className="text-sm font-bold text-emerald-600">{roi}%</span>
          </div>
        </div>

        {/* Maintenance Tasks Priority */}
        {maintenanceTasks > 0 && (
          <div 
            className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 hover:scale-[1.02] transition-all duration-200 shadow-sm"
            onClick={() => navigate(`/tasks?property=${property.id}&filter=maintenance`)}
            title="🔧 Click to view maintenance tasks for this property"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-full">
                  <Wrench className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-orange-800">
                  🔧 {maintenanceTasks} Maintenance Tasks
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-orange-700 hover:text-orange-900 hover:bg-orange-200/50 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tasks?property=${property.id}&filter=maintenance`);
                }}
              >
                View →
              </Button>
            </div>
            {urgentTasks > 0 && (
              <div className="flex items-center gap-2 animate-pulse">
                <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />
                <span className="text-xs text-red-700 font-medium">
                  🚨 {urgentTasks} urgent task{urgentTasks > 1 ? 's' : ''} require attention
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3">
          <Button 
            size="sm" 
            onClick={onViewDetails} 
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 hover:border-emerald-600 hover:scale-[1.02] transition-all duration-200 shadow-sm"
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:scale-105 transition-all duration-200" 
            onClick={() => navigate('/bookings')}
            title="View Bookings & Calendar"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:scale-105 transition-all duration-200"
            onClick={() => navigate(`/finance-hub?property=${property.id}&name=${encodeURIComponent(property.name || 'Property')}`)}
            title="View Property Analytics"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-600 hover:scale-105 transition-all duration-200"
              onClick={onDelete}
              title="Delete Property"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;