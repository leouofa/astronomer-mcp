import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AstronomerApiClient } from "../client/index.js";

export function registerSearchTools(server: McpServer, client: AstronomerApiClient): void {
  server.tool(
    "search",
    "Unified cross-catalog semantic or keyword search across star systems and celestial bodies in the Astronomer comparative astrophysics manifold.",
    {
      q: z.string().describe("Search query text (e.g. 'tidally locked habitable zone exoplanet', 'millisecond pulsar neutron star')"),
      mode: z.enum(["semantic", "keyword", "auto"]).optional().default("auto").describe("Search mode: semantic (pgvector cosine similarity), keyword (text matching), or auto"),
      target_type: z.enum(["all", "star_system", "celestial_body"]).optional().default("all").describe("Filter search results by entity type: all, star_system, or celestial_body"),
      limit: z.number().int().min(1).max(100).optional().default(20).describe("Maximum number of results to return (1-100)")
    },
    async ({ q, mode, target_type, limit }) => {
      try {
        const results = await client.search({ q, mode, target_type, limit });
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Search failed: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "find_counterparts",
    "Find nearest astrophysical counterparts to a specified star system or celestial body using 1024-dimensional pgvector cosine distance.",
    {
      entity_type: z.enum(["star_system", "celestial_body"]).describe("Entity type to find counterparts for: star_system or celestial_body"),
      id: z.number().int().positive().describe("ID of the star system or celestial body"),
      limit: z.number().int().min(1).max(100).optional().default(10).describe("Number of nearest neighbors to return (default: 10)"),
      cosmic_structure_id: z.number().int().positive().optional().describe("Optional cosmic structure (galaxy/cluster) ID to filter counterpart candidates"),
      star_system_id: z.number().int().positive().optional().describe("Optional star system ID to filter counterpart candidates (for celestial body counterparts)"),
      include_embedding: z.boolean().optional().default(false).describe("Whether to include raw 1024-float vector embeddings in results")
    },
    async ({ entity_type, id, limit, cosmic_structure_id, star_system_id, include_embedding }) => {
      try {
        if (entity_type === "star_system") {
          const neighbors = await client.getStarSystemNeighbors(id, { limit, cosmic_structure_id, include_embedding });
          return {
            content: [{ type: "text", text: JSON.stringify(neighbors, null, 2) }]
          };
        } else {
          const neighbors = await client.getCelestialBodyNeighbors(id, { limit, star_system_id, cosmic_structure_id, include_embedding });
          return {
            content: [{ type: "text", text: JSON.stringify(neighbors, null, 2) }]
          };
        }
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Finding counterparts failed: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
