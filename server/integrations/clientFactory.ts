import { getIntegrationForOrg, decrypt } from "../services/integrationStore";
import type { PMSClient } from "./types";
import { DemoAdapter } from "./providers/demoAdapter";
import { HostawayAdapter } from "./providers/hostawayAdapter";

export async function getPMSClient(organizationId: string): Promise<PMSClient> {
  const integ = await getIntegrationForOrg(organizationId);
  if (!integ || !integ.provider) return new DemoAdapter(); // default so trials work

  switch (integ.provider) {
    case "hostaway":
      return new HostawayAdapter({
        apiKey: integ.apiKeyEnc ? decrypt(integ.apiKeyEnc) : undefined,
        accountId: integ.accountId || "",
        accessToken: integ.accessTokenEnc ? decrypt(integ.accessTokenEnc) : undefined,
      });
    case "demo":
      return new DemoAdapter();
    // case "lodgify": return new LodgifyAdapter({...});
    default:
      return new DemoAdapter();
  }
}