import type { Express } from "express";
import { encrypt, getIntegrationForOrg, saveIntegration, removeIntegration } from "../services/integrationStore";
import { HostawayAdapter } from "../integrations/providers/hostawayAdapter";
import { orgContext } from "../middlewares/orgContext";

export default function mountIntegrationRoutes(app: Express) {
  app.use(orgContext());

  // Status
  app.get("/api/integrations/me", async (req: any, res) => {
    const orgId = req.user.organizationId;
    const row = await getIntegrationForOrg(orgId);
    res.json({ provider: row?.provider ?? null });
  });

  // Connect + Test
  app.post("/api/integrations/connect", async (req: any, res) => {
    const orgId = req.user.organizationId;
    const { provider, authType, apiKey, accountId, accessToken } = req.body || {};
    if (!provider || !authType) return res.status(400).json({ message: "provider and authType required" });

    try {
      if (provider === "hostaway") {
        const client = new HostawayAdapter({ apiKey, accountId, accessToken });
        await client.listListings({ limit: 1, offset: 0 }); // throws if creds invalid
      }
      // TODO: other providers tests
    } catch (e: any) {
      return res.status(400).json({ message: "Credentials test failed", error: String(e) });
    }

    await saveIntegration(orgId, {
      provider,
      authType,
      apiKeyEnc: encrypt(apiKey),
      accessTokenEnc: encrypt(accessToken),
      accountId
    } as any);
    res.json({ ok: true });
  });

  // Disconnect
  app.delete("/api/integrations/connect", async (req: any, res) => {
    const orgId = req.user.organizationId;
    await removeIntegration(orgId);
    res.json({ ok: true });
  });
}