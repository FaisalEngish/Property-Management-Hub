export function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    const role = req.user?.role || "guest";
    if (!roles.includes(role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

// Organization context middleware - ensures req.user.organizationId is set
export function orgContext() {
  return (req: any, _res: any, next: any) => {
    if (!req.user) req.user = {};
    req.user.organizationId = req.user.organizationId || "default-org";
    next();
  };
}

// Helper for common role combinations
export const requireAdmin = () => requireRole("admin");
export const requireManagerOrAbove = () => requireRole("admin", "portfolio-manager");
export const requireOwnerOrAbove = () => requireRole("admin", "portfolio-manager", "owner");
export const requireStaffOrAbove = () => requireRole("admin", "portfolio-manager", "owner", "staff");
export const requireAnyAuthenticated = () => requireRole("admin", "portfolio-manager", "owner", "staff", "retail-agent", "referral-agent");