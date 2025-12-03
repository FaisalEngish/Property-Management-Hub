import { getIntegrationForOrg, decrypt } from "../services/integrationStore";
import { DemoAdapter } from "./providers/demoAdapter";
import { HostawayAdapter } from "./providers/hostawayAdapter";

export async function getPMSClient(organizationId: string) {
  const integration = await getIntegrationForOrg(organizationId);
  
  if (!integration) {
    throw new Error("No PMS integration configured");
  }

  const { provider } = integration;

  switch (provider) {
    case "demo":
      return new DemoAdapter();
      
    case "hostaway":
      const apiKey = integration.apiKeyEnc ? decrypt(integration.apiKeyEnc) : undefined;
      const accessToken = integration.accessTokenEnc ? decrypt(integration.accessTokenEnc) : undefined;
      
      return new HostawayAdapter({
        apiKey,
        accessToken,
        accountId: integration.accountId!
      });
      
    default:
      throw new Error(`Unsupported PMS provider: ${provider}`);
  }
}