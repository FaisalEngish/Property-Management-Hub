// ✅ Full Unified Bookings Page — Drop into `/pages/bookings.tsx`
// Works in DEMO MODE with sample data, can be wired later to API or database

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const demoBookings = [
  {
    id: 1,
    property: "Villa Breeze",
    guest: "John Doe",
    checkIn: "2025-07-23",
    checkOut: "2025-07-27",
    bedrooms: 3,
    area: "Bophut",
    manager: "Jane",
    status: "Confirmed"
  },
  {
    id: 2,
    property: "Villa Sunset",
    guest: "Alice Smith",
    checkIn: "2025-07-22",
    checkOut: "2025-07-24",
    bedrooms: 2,
    area: "Lamai",
    manager: "Dean",
    status: "Pending"
  }
];

export default function BookingsPage() {
  const [view, setView] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [manager, setManager] = useState("");
  const [dateFilter, setDateFilter] = useState("All");

  const filtered = demoBookings
    .filter(b =>
      b.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guest.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(b => (area ? b.area === area : true))
    .filter(b => (bedrooms ? b.bedrooms === Number(bedrooms) : true))
    .filter(b => (manager ? b.manager === manager : true))
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Bookings</h2>
        <Button onClick={() => alert("Create booking flow")}>
          + New Booking
        </Button>
      </div>

      <div className="grid md:grid-cols-5 gap-4 p-4 bg-white rounded shadow mb-6">
        <Input
          placeholder="Search Guest or Property"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger>
            <SelectValue placeholder="All Areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Areas</SelectItem>
            <SelectItem value="Bophut">Bophut</SelectItem>
            <SelectItem value="Lamai">Lamai</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger>
            <SelectValue placeholder="All Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Bedrooms</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>
        <Select value={manager} onValueChange={setManager}>
          <SelectTrigger>
            <SelectValue placeholder="All Managers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Managers</SelectItem>
            <SelectItem value="Jane">Jane</SelectItem>
            <SelectItem value="Dean">Dean</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Dates</SelectItem>
            <SelectItem value="Today">Today</SelectItem>
            <SelectItem value="This Week">This Week</SelectItem>
            <SelectItem value="This Month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === "list" && (
        <div className="space-y-4">
          {filtered.map((b) => (
            <Card key={b.id} className="border-l-4 border-blue-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{b.property}</h3>
                    <p className="text-sm text-gray-500">Guest: {b.guest}</p>
                    <p className="text-sm">Check-in: {b.checkIn} → Check-out: {b.checkOut}</p>
                    <p className="text-sm">Area: {b.area} • Bedrooms: {b.bedrooms}</p>
                    <p className="text-sm">Manager: {b.manager}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-white ${
                    b.status === "Confirmed" ? "bg-green-500" : "bg-yellow-500"
                  }`}>
                    {b.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={() => setView(view === "list" ? "calendar" : "list")}>Toggle {view === "list" ? "Calendar" : "List"} View</Button>
      </div>

      {view === "calendar" && (
        <div className="text-center py-8 text-gray-500">
          📅 Calendar View Coming Soon (use list view to manage bookings now)
        </div>
      )}
    </div>
  );
}