export function orgContext() {
  return (req: any, _res: any, next: any) => {
    if (!req.user) req.user = {};
    req.user.organizationId = req.user.organizationId || "default-org";
    next();
  };
}