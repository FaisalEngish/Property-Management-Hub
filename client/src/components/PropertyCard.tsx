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
  Trash2,
  Edit,
  Archive,
  UserCog
} from 'lucide-react';

interface PropertyCardProps {
  property: any;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onViewDetails: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onAssignManager?: () => void;
}

export function PropertyCard({ property, isSelected, onSelect, onViewDetails, onDelete, onEdit, onArchive, onAssignManager }: PropertyCardProps) {
  const [, navigate] = useLocation();
  
  const formatCurrency = (amount: number) => {
    return `฿${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate KPIs
  const occupancyRate = property.occupancyRate || Math.floor(Math.random() * 30) + 60; // 60-90%
  const monthlyRevenue = property.monthlyRevenue || Math.floor(Math.random() * 100000) + 50000;
  const maintenanceCosts = property.maintenanceCosts || Math.floor(Math.random() * 10000) + 5000;
  const maintenanceRatio = ((maintenanceCosts / monthlyRevenue) * 100).toFixed(1);
  const lastBookingDate = property.lastBookingDate || '2024-12-15';
  const roi = property.roi || (Math.random() * 20 + 5).toFixed(1);

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Priority maintenance tasks
  const maintenanceTasks = property.maintenanceTasks || Math.floor(Math.random() * 5) + 1;
  const urgentTasks = Math.floor(maintenanceTasks * 0.3);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 relative">
      <div className="absolute top-4 left-4 z-10">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onSelect}
          className="bg-white border-2"
        />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between pl-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Building className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{property.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-3 w-3" />
                {property.address || 'Bangkok, Thailand'}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(property.status)}>
            {property.status || 'Active'}
          </Badge>
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
              <span className="text-sm font-medium">{occupancyRate}%</span>
            </div>
            <Progress value={occupancyRate} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Monthly Revenue</span>
            <span className="text-sm font-semibold text-green-600">
              {formatCurrency(monthlyRevenue)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Maintenance/Revenue</span>
            <span className={`text-sm font-medium ${
              parseFloat(maintenanceRatio) > 15 ? 'text-red-600' : 
              parseFloat(maintenanceRatio) > 10 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {maintenanceRatio}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">ROI</span>
            <span className="text-sm font-semibold text-blue-600">{roi}%</span>
          </div>
        </div>

        {/* Maintenance Tasks Priority */}
        {maintenanceTasks > 0 && (
          <div 
            className="p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors duration-200"
            onClick={() => navigate(`/tasks?property=${property.id}&filter=maintenance`)}
            title="Click to view maintenance tasks for this property"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  {maintenanceTasks} Maintenance Tasks
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-orange-700 hover:text-orange-900"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tasks?property=${property.id}&filter=maintenance`);
                }}
              >
                View →
              </Button>
            </div>
            {urgentTasks > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-700">
                  {urgentTasks} urgent task{urgentTasks > 1 ? 's' : ''} require attention
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions Row */}
        <div className="flex items-center justify-between pt-2 mb-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Quick Actions:</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
              onClick={onEdit || (() => navigate(`/property/${property.id}/edit`))}
              title="Edit Property"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600"
              onClick={onAssignManager || (() => navigate(`/property/${property.id}/manager`))}
              title="Assign Manager"
            >
              <UserCog className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-orange-50 hover:text-orange-600"
              onClick={onArchive || (() => console.log('Archive property:', property.id))}
              title="Archive Property"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="text-xs text-slate-400">
            ID: {property.id}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3" 
            onClick={() => navigate('/bookings')}
            title="View Bookings & Calendar"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3"
            onClick={() => navigate(`/finance-hub?property=${property.id}&name=${encodeURIComponent(property.name || 'Property')}`)}
            title="View Property Analytics"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
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