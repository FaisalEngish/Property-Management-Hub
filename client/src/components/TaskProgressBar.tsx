import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TaskProgressBarProps {
  status: string;
  priority: 'low' | 'medium' | 'high';
  className?: string;
}

export function TaskProgressBar({ status, priority, className = '' }: TaskProgressBarProps) {
  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 10;
      case 'in_progress':
      case 'in-progress':
        return 50;
      case 'completed':
        return 100;
      case 'approved':
        return 100; // Map approved to completed
      default:
        return 0;
    }
  };

  const getProgressColor = (priority: string, status: string) => {
    if (status === 'completed') return 'bg-green-500';
    
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'approved':
        return 'Completed'; // Map approved to completed text
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const percentage = getProgressPercentage(status);
  const colorClass = getProgressColor(priority, status);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{getStatusText(status)}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${getPriorityColor(priority)}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
          <span className="text-xs text-slate-600">{percentage}%</span>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 10 && (
            <div className="h-full rounded-full bg-gradient-to-r from-transparent to-white/20"></div>
          )}
        </div>
      </div>
    </div>
  );
}