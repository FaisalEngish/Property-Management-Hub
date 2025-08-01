import { LucideIcon } from "lucide-react";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Define role-based access levels
export type UserRole = "admin" | "portfolio-manager" | "owner" | "referral-agent" | "guest" | "retail-agent" | "staff";

// Role hierarchy for permissions (higher = more access)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,           // "Godmode all seeing" - access to everything
  "portfolio-manager": 80,  // High access - manages properties and teams
  owner: 60,            // Property-specific access
  "retail-agent": 50,   // Sales and booking focus
  "referral-agent": 40, // Commission and referral focus
  staff: 30,            // Task and operational focus
  guest: 10,            // Limited guest portal access
};

// Menu access configuration by role
export const ROLE_MENU_ACCESS: Record<UserRole, {
  dashboards: boolean;
  properties: boolean;
  operations: boolean;
  guestServices: boolean;
  finance: boolean;
  system: boolean;
  adminOnly?: boolean;
}> = {
  admin: {
    dashboards: true,
    properties: true,
    operations: true,
    guestServices: true,
    finance: true,
    system: true,
    adminOnly: true,
  },
  "portfolio-manager": {
    dashboards: true,
    properties: true,
    operations: true,
    guestServices: true,
    finance: true,
    system: false, // No system admin access
  },
  owner: {
    dashboards: true,
    properties: true, // Only their own properties
    operations: false,
    guestServices: false,
    finance: true, // Only their property finances
    system: false,
  },
  "retail-agent": {
    dashboards: true,
    properties: true, // Limited to assigned properties
    operations: false,
    guestServices: true,
    finance: false, // Limited finance view
    system: false,
  },
  "referral-agent": {
    dashboards: true,
    properties: false,
    operations: false,
    guestServices: false,
    finance: true, // Commission tracking only
    system: false,
  },
  staff: {
    dashboards: true,
    properties: false,
    operations: true, // Task management focus
    guestServices: true,
    finance: false,
    system: false,
  },
  guest: {
    dashboards: false,
    properties: false,
    operations: false,
    guestServices: true, // Guest portal only
    finance: false,
    system: false,
  },
};

// Filter menu sections based on user role
export function filterMenuForRole(menuSections: MenuSection[], userRole: UserRole): MenuSection[] {
  const access = ROLE_MENU_ACCESS[userRole];
  
  return menuSections.filter(section => {
    // Check section-level access
    const sectionTitle = section.title.toLowerCase();
    
    if (sectionTitle.includes("dashboard")) return access.dashboards;
    if (sectionTitle.includes("property")) return access.properties;
    if (sectionTitle.includes("operation")) return access.operations;
    if (sectionTitle.includes("guest")) return access.guestServices;
    if (sectionTitle.includes("finance") || sectionTitle.includes("revenue")) return access.finance;
    if (sectionTitle.includes("system") || sectionTitle.includes("admin")) return access.system;
    
    return true; // Default to show if not categorized
  }).map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Item-level filtering based on role
      const href = item.href.toLowerCase();
      
      // Admin-only items
      if (item.badge === "ADMIN" && userRole !== "admin") return false;
      
      // System admin items
      if (href.includes("system-hub") || href.includes("admin")) {
        return access.system || access.adminOnly;
      }
      
      // Finance items
      if (href.includes("finance") || href.includes("payout") || href.includes("commission")) {
        // Referral agents only see commission-related items
        if (userRole === "referral-agent") {
          return href.includes("commission") || href.includes("referral");
        }
        return access.finance;
      }
      
      // Property management items
      if (href.includes("property") || href.includes("maintenance")) {
        return access.properties;
      }
      
      // Operations items
      if (href.includes("task") || href.includes("maintenance") || href.includes("cleaning")) {
        return access.operations;
      }
      
      // Guest service items
      if (href.includes("guest") || href.includes("portal")) {
        return access.guestServices;
      }
      
      return true; // Default to show
    })
  })).filter(section => section.items.length > 0); // Remove empty sections
}

// Get role display information
export function getRoleDisplayInfo(role: UserRole): {
  name: string;
  color: string;
  description: string;
} {
  const roleInfo = {
    admin: {
      name: "Administrator",
      color: "text-red-600 bg-red-100",
      description: "Full system access - Godmode all seeing"
    },
    "portfolio-manager": {
      name: "Portfolio Manager",
      color: "text-blue-600 bg-blue-100",
      description: "Manages properties and teams"
    },
    owner: {
      name: "Property Owner",
      color: "text-green-600 bg-green-100",
      description: "Owns and manages specific properties"
    },
    "retail-agent": {
      name: "Retail Agent",
      color: "text-purple-600 bg-purple-100",
      description: "Sales and booking specialist"
    },
    "referral-agent": {
      name: "Referral Agent",
      color: "text-orange-600 bg-orange-100",
      description: "Commission and referral specialist"
    },
    staff: {
      name: "Staff Member",
      color: "text-teal-600 bg-teal-100",
      description: "Operations and task management"
    },
    guest: {
      name: "Guest",
      color: "text-gray-600 bg-gray-100",
      description: "Limited guest portal access"
    }
  };

  return roleInfo[role];
}

// Check if user has access to specific feature
export function hasAccess(userRole: UserRole, feature: string): boolean {
  const access = ROLE_MENU_ACCESS[userRole];
  
  switch (feature.toLowerCase()) {
    case "admin":
    case "system":
      return access.system || access.adminOnly || false;
    case "finance":
      return access.finance;
    case "properties":
      return access.properties;
    case "operations":
      return access.operations;
    case "guest-services":
      return access.guestServices;
    case "dashboards":
      return access.dashboards;
    default:
      return true;
  }
}