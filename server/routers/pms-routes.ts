import type { Express } from "express";
import { getPMSClient } from "../integrations/factory";
import { requireRole } from "../middlewares/requireRole";
import { orgContext } from "../middlewares/orgContext";

export default function mountPmsRoutes(app: Express) {
  app.use(orgContext());

  app.get("/api/pms/listings",
    requireRole("admin","portfolio-manager","retail-agent"),
    async (req: any, res) => {
      try {
        const client = await getPMSClient(req.user.organizationId);
        const limit = Number(req.query.limit ?? 50);
        const offset = Number(req.query.offset ?? 0);
        const out = await client.listListings({ limit, offset });
        res.json(out);
      } catch (error) {
        console.error('PMS listings error:', error);
        res.status(500).json({ 
          error: 'Failed to fetch listings',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

  app.get("/api/pms/availability",
    requireRole("admin","retail-agent","owner"),
    async (req: any, res) => {
      try {
        const client = await getPMSClient(req.user.organizationId);
        const { listingId, start, end } = req.query as Record<string,string>;
        if (!listingId || !start || !end) {
          return res.status(400).json({ message: "listingId, start, end required" });
        }
        const out = await client.getAvailability({ listingId, start, end });
        res.json(out);
      } catch (error) {
        console.error('PMS availability error:', error);
        res.status(500).json({ 
          error: 'Failed to fetch availability',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
}