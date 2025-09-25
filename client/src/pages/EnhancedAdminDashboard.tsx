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
    <div className="w-full max-w-7xl mx-auto px-6 pt-4 pb-12 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive property management overview with advanced filtering</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-100 text-sm rounded">Administrator</span>
          <button
            className="p-2 hover:bg-gray-100 rounded"
            onClick={() => {
              setLocation("/settings");
            }}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters - Simplified */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setActiveFilters({...activeFilters, searchText: e.target.value})}
            />
          </div>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
          Clear Filters
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold">{Array.isArray(properties) ? properties.length : 0}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks</p>
              <p className="text-2xl font-bold">{Array.isArray(tasks) ? tasks.length : 0}</p>
            </div>
            <ListTodo className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bookings</p>
              <p className="text-2xl font-bold">{Array.isArray(bookings) ? bookings.length : 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue (THB)</p>
              <p className="text-2xl font-bold">{Array.isArray(finances) ? finances.filter(f => f.type === 'revenue').reduce((sum, f) => sum + (f.amount || 0), 0).toLocaleString() : '0'}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Data Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Properties</h3>
          <div className="space-y-3">
            {Array.isArray(properties) ? properties.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">{property.name}</h4>
                  <p className="text-sm text-gray-600">{property.address}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {property.status}
                </span>
              </div>
            )) : <p className="text-gray-500">No properties available</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {Array.isArray(tasks) ? tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${task.status === 'completed' ? 'bg-green-100 text-green-800' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {task.status}
                </span>
              </div>
            )) : <p className="text-gray-500">No tasks available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}