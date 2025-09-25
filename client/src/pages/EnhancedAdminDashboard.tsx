import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Building, Calendar, ListTodo, DollarSign, Settings } from "lucide-react";

export default function EnhancedAdminDashboard() {
  const [location, setLocation] = useLocation();
  const [activeFilters, setActiveFilters] = useState<any>({});
  
  // Fetch real data from API
  const { data: properties = [] } = useQuery({ queryKey: ["/api/properties"] });
  const { data: tasks = [] } = useQuery({ queryKey: ["/api/tasks"] });
  const { data: bookings = [] } = useQuery({ queryKey: ["/api/bookings"] });
  const { data: finances = [] } = useQuery({ queryKey: ["/api/finance"] });

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Admin Dashboard</h1>
              <p className="text-gray-600">Comprehensive property management overview with advanced filtering</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                Administrator
              </span>
              <button
                className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setLocation("/settings")}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties, tasks, or bookings..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  onChange={(e) => setActiveFilters({...activeFilters, searchText: e.target.value})}
                />
              </div>
            </div>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Properties</p>
                <p className="text-3xl font-bold text-gray-900">{Array.isArray(properties) ? properties.length : 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{Array.isArray(tasks) ? tasks.length : 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ListTodo className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{Array.isArray(bookings) ? bookings.length : 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Revenue (THB)</p>
                <p className="text-3xl font-bold text-gray-900">{Array.isArray(finances) ? finances.filter(f => f.type === 'revenue').reduce((sum, f) => sum + (f.amount || 0), 0).toLocaleString() : '0'}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Data Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Recent Properties</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Array.isArray(properties) ? properties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{property.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {property.status}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No properties available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Recent Tasks</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Array.isArray(tasks) ? tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {task.status}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tasks available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}