// import React from "react";
// import { useLocation } from "wouter";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Badge } from "./ui/badge";
// import { Button } from "./ui/button";
// import { Checkbox } from "./ui/checkbox";
// import { Progress } from "./ui/progress";
// import {
//   Building,
//   Calendar,
//   DollarSign,
//   TrendingUp,
//   Wrench,
//   Users,
//   MapPin,
//   Star,
//   AlertTriangle,
//   CheckCircle,
//   Trash2,
// } from "lucide-react";

// interface PropertyCardProps {
//   property: any;
//   isSelected: boolean;
//   onSelect: (selected: boolean) => void;
//   onViewDetails: () => void;
//   onDelete?: () => void;
//   expiryStatus?: "expiring" | "expired" | null;
// }

// export function PropertyCard({
//   property,
//   isSelected,
//   onSelect,
//   onViewDetails,
//   onDelete,
//   expiryStatus,
// }: PropertyCardProps) {
//   const [, navigate] = useLocation();

//   const formatCurrency = (amount: number) => {
//     return `฿${Number(amount || 0).toLocaleString()}`;
//   };

//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return "No bookings yet";
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   // KPIs (default to 0)
//   const occupancyRate = Math.round(property.occupancyRate || 0);
//   const monthlyRevenue = Math.round(property.monthlyRevenue || 0);
//   const maintenanceCosts = Math.round(property.maintenanceCosts || 0);
//   const maintenanceRatio =
//     monthlyRevenue > 0
//       ? ((maintenanceCosts / monthlyRevenue) * 100).toFixed(1)
//       : "0.0";
//   const lastBookingDate = property.lastBookingDate || null;
//   const roi = Number(property.roi || 0);

//   // Tasks
//   const maintenanceTasks = Number(property.maintenanceTasks || 0);
//   const highPriorityTasks = Number(property.highPriorityTasks || 0);
//   const taskAssignee = property.taskAssignee || null;
//   const totalAssignedTasks = Number(property.totalAssignedTasks || 0);

//   // Analytic tags (max 2)
//   const getAnalyticsTags = () => {
//     const tags: { label: string; color: string; icon: string }[] = [];
//     if (expiryStatus === "expired")
//       tags.push({
//         label: "Document Expired",
//         color: "bg-red-50 text-red-700",
//         icon: "🔴",
//       });
//     else if (expiryStatus === "expiring")
//       tags.push({
//         label: "Expiring Soon",
//         color: "bg-orange-50 text-orange-700",
//         icon: "🟠",
//       });

//     if (highPriorityTasks > 0)
//       tags.push({
//         label: `${highPriorityTasks} High Priority`,
//         color: "bg-red-50 text-red-700",
//         icon: "⚠️",
//       });
//     if (roi > 15)
//       tags.push({
//         label: "High ROI",
//         color: "bg-emerald-50 text-emerald-700",
//         icon: "📈",
//       });
//     if (occupancyRate < 70)
//       tags.push({
//         label: "Low Occupancy",
//         color: "bg-orange-50 text-orange-700",
//         icon: "📊",
//       });
//     if (maintenanceTasks > 3)
//       tags.push({
//         label: `${maintenanceTasks} Active Tasks`,
//         color: "bg-orange-50 text-orange-700",
//         icon: "📋",
//       });
//     if (monthlyRevenue > 120000)
//       tags.push({
//         label: "Premium",
//         color: "bg-purple-50 text-purple-700",
//         icon: "⭐",
//       });

//     return tags.slice(0, 2);
//   };
//   const analyticsTags = getAnalyticsTags();

//   // status style helper
//   const statusClass = (status?: string) => {
//     switch (status?.toLowerCase()) {
//       case "active":
//         return "bg-emerald-100 text-emerald-800 border-emerald-200";
//       case "maintenance":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "inactive":
//         return "bg-red-100 text-red-800 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   return (
//     <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-xl transition-shadow duration-300">
//       {/* Left floating checkbox */}
//       <div className="absolute top-4 left-4 z-20">
//         <Checkbox
//           checked={isSelected}
//           onCheckedChange={onSelect}
//           className="bg-white/95 border-emerald-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 shadow-sm"
//         />
//       </div>

//       {/* Hover actions */}
//       <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-9 w-9 p-0 rounded-full bg-white/90 shadow-sm hover:bg-emerald-50"
//           onClick={(e) => {
//             e.stopPropagation();
//             navigate(`/property/${property.id}/edit`);
//           }}
//           title="Edit"
//         >
//           ✏️
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-9 w-9 p-0 rounded-full bg-white/90 shadow-sm hover:bg-emerald-50"
//           onClick={(e) => {
//             e.stopPropagation();
//             navigate("/bookings");
//           }}
//           title="Calendar"
//         >
//           📅
//         </Button>
//       </div>

//       {/* Analytics tags */}
//       {analyticsTags.length > 0 && (
//         <div className="absolute top-16 left-4 z-10 flex flex-col gap-2">
//           {analyticsTags.map((t, i) => (
//             <Badge
//               key={i}
//               variant="outline"
//               className={`${t.color} text-xs font-medium px-2 py-1 rounded-full shadow-sm`}
//             >
//               <span className="mr-1">{t.icon}</span> {t.label}
//             </Badge>
//           ))}
//         </div>
//       )}

//       <CardHeader className="pb-3">
//         <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 pl-8 pr-4">
//           <div className="flex-shrink-0 flex items-center">
//             <div className="relative h-16 w-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-50 shadow-inner text-3xl">
//               <div className="absolute inset-0 rounded-xl opacity-40" />
//               <div>
//                 {property.name?.toLowerCase().includes("beach") ||
//                 property.name?.toLowerCase().includes("ocean")
//                   ? "🏖️"
//                   : property.name?.toLowerCase().includes("villa")
//                     ? "🏡"
//                     : property.name?.toLowerCase().includes("tropical") ||
//                         property.name?.toLowerCase().includes("paradise")
//                       ? "🌴"
//                       : property.name?.toLowerCase().includes("samui")
//                         ? "🏝️"
//                         : "🏠"}
//               </div>
//             </div>
//           </div>

//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between gap-4">
//               <div className="min-w-0">
//                 <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 truncate">
//                   {property.name || "Unnamed Property"}
//                 </CardTitle>
//                 <div className="flex items-center gap-3 mt-1">
//                   <div
//                     className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusClass(property.status)} border`}
//                   >
//                     {property.status || "Active"}
//                   </div>
//                   <div className="flex items-center gap-2 text-xs text-slate-500">
//                     <MapPin className="h-3 w-3" />
//                     <span className="truncate max-w-[14rem]">
//                       {property.address || "Bangkok, Thailand"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* small KPIs on the right (mobile hides) */}
//               <div className="hidden sm:flex flex-col items-end gap-1">
//                 <div className="text-sm font-semibold text-emerald-700">
//                   {formatCurrency(monthlyRevenue)}
//                 </div>
//                 <div className="text-xs text-slate-500">Monthly revenue</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="pt-0 pb-4 px-4 sm:px-6">
//         {/* small responsive stats grid */}
//         <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-4">
//           <div className="bg-slate-50 p-2 rounded-lg text-center">
//             <div className="text-lg font-semibold">
//               {property.bedrooms ?? 3}
//             </div>
//             <div className="text-xs text-slate-500">Beds</div>
//           </div>
//           <div className="bg-slate-50 p-2 rounded-lg text-center">
//             <div className="text-lg font-semibold">
//               {property.bathrooms ?? 2}
//             </div>
//             <div className="text-xs text-slate-500">Baths</div>
//           </div>
//           <div className="bg-slate-50 p-2 rounded-lg text-center">
//             <div className="text-lg font-semibold">
//               {property.capacity ?? 6}
//             </div>
//             <div className="text-xs text-slate-500">Guests</div>
//           </div>
//         </div>

//         {/* occupancy and progress */}
//         <div className="mb-4">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-slate-600">Occupancy</div>
//             <div className="text-sm font-semibold text-emerald-700">
//               {occupancyRate}%
//             </div>
//           </div>
//           <div className="mt-2 h-3 w-full bg-slate-200 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
//               style={{ width: `${Math.max(0, Math.min(occupancyRate, 100))}%` }}
//             />
//           </div>
//         </div>

//         {/* revenue & maintenance */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center mb-4">
//           <div className="sm:col-span-2">
//             <div className="flex items-center justify-between mb-1">
//               <div className="text-sm text-slate-600">Monthly Revenue</div>
//               <div className="text-sm font-medium text-emerald-700">
//                 {formatCurrency(monthlyRevenue)}
//               </div>
//             </div>
//             <div className="h-2 w-full bg-slate-200 rounded-full">
//               <div
//                 className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
//                 style={{
//                   width: `${Math.min((monthlyRevenue / 200000) * 100, 100)}%`,
//                 }}
//               />
//             </div>
//           </div>

//           <div className="text-xs text-right">
//             <div
//               className={`font-semibold ${parseFloat(maintenanceRatio) > 15 ? "text-red-600" : parseFloat(maintenanceRatio) > 10 ? "text-yellow-600" : "text-emerald-600"}`}
//             >
//               {maintenanceRatio}%
//             </div>
//             <div className="text-xs text-slate-500">Maint / Revenue</div>
//           </div>
//         </div>

//         {/* ROI & last booking row */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
//           <div className="flex items-center gap-3">
//             <div className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 shadow-inner flex items-center gap-2">
//               <TrendingUp className="h-4 w-4" /> ROI {roi}%
//             </div>
//             <div className="rounded-lg bg-slate-50 px-3 py-1 text-sm text-slate-600">
//               Last booking:{" "}
//               <span className="font-medium ml-1">
//                 {formatDate(lastBookingDate)}
//               </span>
//             </div>
//           </div>

//           {/* small action group on right for mobile-friendly stacking */}
//           <div className="flex items-center gap-2">
//             <Button
//               size="sm"
//               onClick={onViewDetails}
//               className="bg-emerald-500 text-white hover:bg-emerald-600"
//             >
//               View
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => navigate("/bookings")}
//             >
//               <Calendar className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() =>
//                 navigate(
//                   `/finance-hub?property=${property.id}&name=${encodeURIComponent(property.name || "Property")}`,
//                 )
//               }
//             >
//               <TrendingUp className="h-4 w-4" />
//             </Button>
//             {onDelete && (
//               <Button
//                 variant="destructive"
//                 size="sm"
//                 onClick={onDelete}
//                 title="Delete property"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Active tasks block */}
//         {maintenanceTasks > 0 && (
//           <div
//             className="p-3 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
//             onClick={() => navigate(`/tasks?property=${property.id}`)}
//             title="View tasks"
//           >
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-2">
//                 <div className="p-1 rounded bg-orange-100">
//                   <Wrench className="h-4 w-4 text-orange-600" />
//                 </div>
//                 <div className="text-sm font-semibold text-orange-800">
//                   {" "}
//                   {maintenanceTasks} Active Task
//                   {maintenanceTasks > 1 ? "s" : ""}
//                 </div>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   navigate(`/tasks?property=${property.id}`);
//                 }}
//               >
//                 View →
//               </Button>
//             </div>

//             {highPriorityTasks > 0 && (
//               <div className="flex items-center gap-2 text-xs text-red-700 mb-1">
//                 <AlertTriangle className="h-3 w-3" /> ⚠️ {highPriorityTasks}{" "}
//                 high priority task{highPriorityTasks > 1 ? "s" : ""}
//               </div>
//             )}

//             {totalAssignedTasks > 0 && taskAssignee && (
//               <div className="flex items-center gap-2 text-xs text-slate-600">
//                 <Users className="h-3 w-3" /> {totalAssignedTasks} assigned to
//                 staff
//               </div>
//             )}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// export default PropertyCard;

import React from "react";
import {
  MapPin,
  Star,
  Home,
  Bath,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface PropertyCardProps {
  property: any;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onViewDetails?: () => void;
  onDelete?: () => void;
  expiryStatus?: "expiring" | "expired" | null;
}

export default function PropertyCard({
  property,
  isSelected = false,
  onSelect,
  onViewDetails,
  onDelete,
  expiryStatus,
}: PropertyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500/90 text-white";
      case "maintenance":
        return "bg-amber-500/90 text-white";
      case "inactive":
        return "bg-slate-500/90 text-white";
      default:
        return "bg-slate-500/90 text-white";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.8) return "text-amber-400";
    if (rating >= 4.5) return "text-amber-300";
    return "text-amber-200";
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 85) return "from-emerald-500 to-teal-500";
    if (occupancy >= 70) return "from-blue-500 to-cyan-500";
    if (occupancy >= 50) return "from-amber-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  // ---- Map API fields ----
  const title = property.name || "Property";
  const address = property.address || "Unknown Address";
  const bedrooms = property.bedrooms ?? 0;
  const bathrooms = property.bathrooms ?? 0;
  const capacity = property.maxGuests ?? 0;
  const pricePerNight = parseFloat(property.pricePerNight || "0");
  const monthly = property.monthlyRevenue ?? 0;
  const occupancy = property.occupancyRate ?? 0;
  const rating = property.rating ?? 4.7;

  // ---- Image ----
  const imageUrl =
    (Array.isArray(property.images) &&
      property.images.length > 0 &&
      property.images[0]) ||
    `https://picsum.photos/seed/property-${property.id || "0"}/800/600`;

  const occupancyColor = getOccupancyColor(occupancy);

  // ---- Address / Map link ----
  const raw = property.googleMapsLink || "";
  let mapHref = "";
  const iframeMatch = raw.match(/src=(?:\"|')([^\"']+)(?:\"|')/i);
  if (iframeMatch && iframeMatch[1]) {
    mapHref = iframeMatch[1];
  } else if (
    raw &&
    (raw.startsWith("http") ||
      raw.includes("google.com/maps") ||
      raw.includes("maps.google"))
  ) {
    mapHref = raw;
  } else if (address) {
    mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
  } else {
    mapHref = "https://www.google.com/maps";
  }

  const formatPrice = (value: number, currency?: string) => {
    try {
      const code = currency || property.currency || "THB";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
      }).format(value);
    } catch {
      return `${value}`;
    }
  };

  const formatMonthly = (val: number) => {
    if (!val) return "฿0";
    if (val >= 1000) return `${Math.round(val / 100) / 10}k`;
    return `${val}`;
  };

  return (
    <div className="group relative h-full">
      <div
        className={`h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-2 ${
          isSelected
            ? "border-emerald-500 ring-2 ing-emerald-300"
            : "border-slate-200 hover:border-emerald-300"
        }`}
      >
        {/* Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e: any) => {
              e.currentTarget.src = `https://picsum.photos/seed/property-${
                property.id || "0"
              }/800/600`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Status */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
            <div
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md ${getStatusColor(
                property.status,
              )}`}
            >
              {property.status === "active"
                ? "✓ Active"
                : property.status || "Status"}
            </div>
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Star
                className={`h-4 w-4 ${getRatingColor(rating)}`}
                fill="currentColor"
              />
              <span className="text-white font-semibold text-sm">
                {rating ? rating.toFixed(1) : "—"}
              </span>
            </div>
          </div>

          {/* Expiry badge */}
          {expiryStatus && (
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold ${
                  expiryStatus === "expired"
                    ? "bg-red-500/90 text-white"
                    : "bg-amber-500/90 text-white"
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {expiryStatus === "expired" ? "Expired" : "Expiring Soon"}
              </div>
            </div>
          )}

          {/* Select checkbox */}
          {onSelect && (
            <div className="absolute top-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(e.target.checked)}
                className="w-5 h-5 cursor-pointer rounded border-2 border-white bg-emerald-500 checked:bg-emerald-600 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-white to-slate-50 p-4 sm:p-5 lg:p-6">
          {/* Title + Address */}
          <div className="mb-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate mb-1">
              {title}
            </h3>

            {/* ✅ Google Maps Link */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <MapPin className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate underline-offset-2 hover:underline text-slate-700"
                onClick={(e) => e.stopPropagation()}
                title="Open location in Google Maps"
              >
                {address}
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-2.5 text-center border border-blue-200/50">
              <Home className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <div className="text-xs sm:text-sm font-bold text-blue-900">
                {bedrooms}
              </div>
              <div className="text-xs text-blue-700">Beds</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-2.5 text-center border border-teal-200/50">
              <Bath className="h-4 w-4 mx-auto mb-1 text-teal-600" />
              <div className="text-xs sm:text-sm font-bold text-teal-900">
                {bathrooms}
              </div>
              <div className="text-xs text-teal-700">Baths</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-2.5 text-center border border-emerald-200/50">
              <Users className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
              <div className="text-xs sm:text-sm font-bold text-emerald-900">
                {capacity}
              </div>
              <div className="text-xs text-emerald-700">Guests</div>
            </div>
          </div>

          {/* Occupancy */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                Occupancy
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700">
                {occupancy}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${occupancyColor} rounded-full transition-all duration-700 shadow-md`}
                style={{ width: `${Math.min(occupancy, 100)}%` }}
              />
            </div>
          </div>

          {/* Revenue & Price */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-xl p-3 border border-amber-200/50">
              <div className="text-xs text-amber-700 font-semibold mb-1">
                Price / Night
              </div>
              <div className="text-xs sm:text-sm font-bold text-amber-900">
                {formatPrice(pricePerNight, property.currency)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-xl p-3 border border-emerald-200/50">
              <div className="text-xs text-emerald-700 font-semibold mb-1">
                Monthly
              </div>
              <div className="text-[10px] sm:text-xl font-bold text-emerald-900">
                {formatMonthly(monthly)}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={onViewDetails}
              className="flex-1 px-3 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              View Details
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-3 py-2.5 sm:py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs sm:text-sm rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-2xl pointer-events-none" />
      </div>
    </div>
  );
}
