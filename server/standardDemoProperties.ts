import { db } from "./db";
import { properties } from "@shared/schema";
import { and, eq } from "drizzle-orm";

/**
 * LEGACY: This used to seed 4 hard-coded demo properties.
 *
 * We no longer want any static demo properties.
 * All properties now come from:
 *  - Properties created through the Property Hub (source = "LOCAL")
 *  - Properties imported from Hostaway (source = "HOSTAWAY")
 *
 * We keep this function so existing seed scripts can still call it
 * without breaking, but it doesn't insert anything anymore.
 */
export async function ensureStandardDemoProperties() {
  console.log(
    "[standardDemoProperties] Skipping demo seed – using dynamic properties only.",
  );
}

/**
 * Gets property IDs for use in other seeding functions.
 *
 * Previously this returned the 4 demo properties.
 * Now it simply returns whatever properties currently exist
 * for the given organization + owner (default demo values).
 *
 * This lets existing code keep working, but based on real properties.
 */
export async function getStandardDemoPropertyIds(
  organizationId = "default-org",
  ownerId = "demo-owner",
): Promise<number[]> {
  const rows = await db
    .select({ id: properties.id })
    .from(properties)
    .where(
      and(
        eq(properties.organizationId, organizationId),
        eq(properties.ownerId, ownerId),
      ),
    );

  return rows.map((r) => r.id);
}
