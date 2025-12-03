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
  rentcastData?: any;
}

export default function PropertyCard({
  property,
  isSelected = false,
  onSelect,
  onViewDetails,
  onDelete,
  expiryStatus,
  rentcastData,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [imageLoaded, setImageLoaded] = React.useState(false);

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
  // Filter out invalid local file paths and empty/blank URLs
  const validImages = Array.isArray(property.images)
    ? property.images
        .filter((img: string) => {
          if (!img || typeof img !== 'string' || img.trim() === '') return false;
          if (img.startsWith('file:///') || img.startsWith('file://')) return false;
          if (img.match(/^[A-Z]:\\/i)) return false;
          // Ensure it's a valid HTTP(S) URL or relative path
          return img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/');
        })
        .map(url => url.trim()) // Clean up whitespace
        .filter(url => url.length > 10) // Ensure URL has reasonable length
    : [];
  
  const getHighQualityImageUrl = (url: string) => {
    if (!url) {
      return null; // No fallback to demo images
    }
    
    // For Hostaway and other CDN images, strip any size/quality downgrade params
    // This ensures we always get the full-resolution original
    try {
      const urlObj = new URL(url);
      
      // Remove common thumbnail/resize parameters
      const paramsToRemove = ['w', 'width', 'h', 'height', 'q', 'quality', 'resize', 'fit', 'thumb'];
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      
      return urlObj.toString();
    } catch {
      // If URL parsing fails, return original
      return url;
    }
  };
  
  // Check if this is a local property (no external source)
  const isLocalProperty = !property.source || property.source === 'LOCAL';
  const hasValidImages = validImages.length > 0;
  
  const imageUrl = hasValidImages
    ? getHighQualityImageUrl(validImages[currentImageIndex])
    : null; // No demo images - show blank placeholder instead

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageLoaded(false);
    setCurrentImageIndex((prev) => 
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageLoaded(false);
    setCurrentImageIndex((prev) => 
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  // Preload next/prev images for smoother transitions
  React.useEffect(() => {
    if (validImages.length > 1) {
      const nextIndex = (currentImageIndex + 1) % validImages.length;
      const prevIndex = (currentImageIndex - 1 + validImages.length) % validImages.length;
      
      [nextIndex, prevIndex].forEach(idx => {
        const img = new Image();
        img.src = getHighQualityImageUrl(validImages[idx]);
      });
    }
  }, [currentImageIndex, validImages]);

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
          {imageUrl ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-200 animate-pulse">
                  <div className="text-slate-400 text-sm">Loading...</div>
                </div>
              )}
              <img
                key={`${property.id}-${currentImageIndex}`}
                src={imageUrl}
                alt={title}
                className={`w-full h-full object-contain bg-slate-50 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                onLoad={() => setImageLoaded(true)}
                onError={(e: any) => {
                  console.warn(`Failed to load image for ${title}:`, imageUrl);
                  setImageLoaded(true);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
              <Home className="h-16 w-16 text-slate-300 mb-2" />
              <span className="text-slate-400 text-sm font-medium">No Image</span>
              {isLocalProperty && (
                <span className="text-slate-300 text-xs mt-1">Upload images in property details</span>
              )}
            </div>
          )}

          {/* Image Navigation Controls */}
          {validImages.length > 1 && (
            <>
              {/* Photo Count Badge - Top Center */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-white text-sm font-semibold">+{validImages.length - 1} photos</span>
              </div>

              {/* Left Arrow */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-slate-800 rounded-full p-2 shadow-lg transition-all duration-200"
                data-testid="button-prev-image"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-slate-800 rounded-full p-2 shadow-lg transition-all duration-200"
                data-testid="button-next-image"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Image Counter - Bottom Center */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-semibold">
                  {currentImageIndex + 1}/{validImages.length}
                </span>
              </div>
            </>
          )}

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
              <div className="text-sm sm:text-sm font-bold text-amber-900">
                {formatPrice(pricePerNight, property.currency)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-xl p-3 border border-emerald-200/50">
              <div className="text-xs text-emerald-700 font-semibold mb-1">
                Monthly
              </div>
              <div className="text-sm sm:text-xl font-bold text-emerald-900">
                {formatMonthly(monthly)}
              </div>
            </div>
          </div>

          {/* RentCast Comprehensive Market Intelligence */}
          {rentcastData && (
            <div className="mb-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div className="text-xs font-bold text-purple-900">
                  RentCast Market Intelligence
                </div>
              </div>

              {/* Rent & Value Estimates */}
              {(rentcastData.rentEstimate || rentcastData.valueEstimate) && (
                <div className="grid grid-cols-2 gap-3">
                  {rentcastData.rentEstimate && (
                    <div className="bg-white/80 rounded-lg p-2">
                      <div className="text-[10px] text-purple-600 font-semibold mb-0.5">
                        MONTHLY RENT
                      </div>
                      <div className="text-base font-bold text-purple-900">
                        $
                        {rentcastData.rentEstimate.estimatedRent?.toLocaleString() ||
                          "N/A"}
                      </div>
                      {rentcastData.rentEstimate.rentRangeLow &&
                        rentcastData.rentEstimate.rentRangeHigh && (
                          <div className="text-[9px] text-purple-700">
                            $
                            {rentcastData.rentEstimate.rentRangeLow.toLocaleString()}{" "}
                            - $
                            {rentcastData.rentEstimate.rentRangeHigh.toLocaleString()}
                          </div>
                        )}
                      {rentcastData.rentEstimate.comparablesCount > 0 && (
                        <div className="text-[9px] text-purple-600 mt-0.5">
                          {rentcastData.rentEstimate.comparablesCount} comps
                        </div>
                      )}
                    </div>
                  )}

                  {rentcastData.valueEstimate && (
                    <div className="bg-white/80 rounded-lg p-2">
                      <div className="text-[10px] text-indigo-600 font-semibold mb-0.5">
                        PROPERTY VALUE
                      </div>
                      <div className="text-base font-bold text-indigo-900">
                        $
                        {Math.round(
                          (rentcastData.valueEstimate.estimatedValue || 0) /
                            1000,
                        )}
                        k
                      </div>
                      {rentcastData.valueEstimate.valueRangeLow &&
                        rentcastData.valueEstimate.valueRangeHigh && (
                          <div className="text-[9px] text-indigo-700">
                            $
                            {Math.round(
                              rentcastData.valueEstimate.valueRangeLow / 1000,
                            )}
                            k - $
                            {Math.round(
                              rentcastData.valueEstimate.valueRangeHigh / 1000,
                            )}
                            k
                          </div>
                        )}
                      {rentcastData.valueEstimate.comparablesCount > 0 && (
                        <div className="text-[9px] text-indigo-600 mt-0.5">
                          {rentcastData.valueEstimate.comparablesCount} comps
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Property Details */}
              {rentcastData.propertyDetails && (
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-[10px] font-semibold text-purple-700 mb-1.5">
                    PROPERTY DATA
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                    {rentcastData.propertyDetails.squareFootage && (
                      <div className="flex justify-between">
                        <span className="text-purple-600">Sq Ft:</span>
                        <span className="font-medium text-purple-900">
                          {rentcastData.propertyDetails.squareFootage.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {rentcastData.propertyDetails.yearBuilt && (
                      <div className="flex justify-between">
                        <span className="text-purple-600">Built:</span>
                        <span className="font-medium text-purple-900">
                          {rentcastData.propertyDetails.yearBuilt}
                        </span>
                      </div>
                    )}
                    {rentcastData.propertyDetails.lotSize && (
                      <div className="flex justify-between">
                        <span className="text-purple-600">Lot:</span>
                        <span className="font-medium text-purple-900">
                          {rentcastData.propertyDetails.lotSize.toLocaleString()}{" "}
                          sf
                        </span>
                      </div>
                    )}
                    {rentcastData.propertyDetails.propertyType && (
                      <div className="flex justify-between">
                        <span className="text-purple-600">Type:</span>
                        <span className="font-medium text-purple-900">
                          {rentcastData.propertyDetails.propertyType}
                        </span>
                      </div>
                    )}
                    {rentcastData.propertyDetails.lastSalePrice && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-purple-600">Last Sale:</span>
                        <span className="font-medium text-purple-900">
                          $
                          {rentcastData.propertyDetails.lastSalePrice.toLocaleString()}
                          {rentcastData.propertyDetails.lastSaleDate &&
                            ` (${new Date(rentcastData.propertyDetails.lastSaleDate).getFullYear()})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Market Data */}
              {rentcastData.marketData && (
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-[10px] font-semibold text-indigo-700 mb-1.5">
                    MARKET STATS
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                    {rentcastData.marketData.medianRent && (
                      <div className="flex justify-between">
                        <span className="text-indigo-600">Median Rent:</span>
                        <span className="font-medium text-indigo-900">
                          ${rentcastData.marketData.medianRent.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {rentcastData.marketData.averageRent && (
                      <div className="flex justify-between">
                        <span className="text-indigo-600">Avg Rent:</span>
                        <span className="font-medium text-indigo-900">
                          $
                          {rentcastData.marketData.averageRent.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {rentcastData.marketData.medianPrice && (
                      <div className="flex justify-between">
                        <span className="text-indigo-600">Median Price:</span>
                        <span className="font-medium text-indigo-900">
                          $
                          {Math.round(
                            rentcastData.marketData.medianPrice / 1000,
                          )}
                          k
                        </span>
                      </div>
                    )}
                    {rentcastData.marketData.averagePrice && (
                      <div className="flex justify-between">
                        <span className="text-indigo-600">Avg Price:</span>
                        <span className="font-medium text-indigo-900">
                          $
                          {Math.round(
                            rentcastData.marketData.averagePrice / 1000,
                          )}
                          k
                        </span>
                      </div>
                    )}
                    {rentcastData.marketData.inventoryCount && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-indigo-600">
                          Market Inventory:
                        </span>
                        <span className="font-medium text-indigo-900">
                          {rentcastData.marketData.inventoryCount.toLocaleString()}{" "}
                          listings
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nearby Rentals */}
              {rentcastData.nearbyRentals?.count > 0 && (
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-[10px] font-semibold text-purple-700 mb-1.5">
                    NEARBY RENTALS ({rentcastData.nearbyRentals.count})
                  </div>
                  <div className="space-y-1.5">
                    {rentcastData.nearbyRentals.listings
                      .slice(0, 2)
                      .map((listing: any, idx: number) => (
                        <div
                          key={idx}
                          className="text-[9px] bg-purple-50 rounded p-1.5"
                        >
                          <div className="font-medium text-purple-900 truncate">
                            {listing.address}
                          </div>
                          <div className="flex justify-between text-purple-700">
                            <span>${listing.price.toLocaleString()}/mo</span>
                            <span>
                              {listing.bedrooms}bd {listing.bathrooms}ba
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
