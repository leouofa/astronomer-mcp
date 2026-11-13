import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AstronomerApiClient } from "../client/index.js";

export function registerStarSystemTools(server: McpServer, client: AstronomerApiClient): void {
  server.tool(
    "list_star_systems",
    "List and filter star systems with astrophysical themes, celestial body counts, and vector embedding status.",
    {
      cosmic_structure_id: z.number().int().positive().optional().describe("Filter by cosmic structure ID"),
      cosmic_structure: z.string().optional().describe("Filter by cosmic structure name substring (e.g. 'Milky Way')"),
      theme: z.string().optional().describe("Filter star systems containing thematic tag (e.g. 'binary', 'neutron star', 'habitable zone')"),
      q: z.string().optional().describe("Search star system name or description substring"),
      embedded: z.boolean().optional().describe("Filter by whether vector embedding has been generated"),
      include_celestial_bodies: z.boolean().optional().default(false).describe("Include associated celestial bodies (planets/moons)"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-float vector array"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async (params) => {
      try {
        const result = await client.listStarSystems(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list star systems: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_star_system",
    "Retrieve full profile of a star system including cosmic structure, thematic astrophysical tags, and celestial bodies.",
    {
      id: z.number().int().positive().describe("Star System ID"),
      include_celestial_bodies: z.boolean().optional().default(true).describe("Include celestial bodies belonging to this star system"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-dim vector embedding")
    },
    async ({ id, include_celestial_bodies, include_embedding }) => {
      try {
        const star_system = await client.getStarSystem(id, { include_celestial_bodies, include_embedding });
        return {
          content: [{ type: "text", text: JSON.stringify(star_system, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get star system ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_star_system",
    "Create a new star system record associated with a cosmic structure.",
    {
      cosmic_structure_id: z.number().int().positive().describe("Cosmic Structure ID"),
      name: z.string().min(1).describe("Name of the star system (e.g. 'TRAPPIST-1', 'Sirius')"),
      description: z.string().optional().describe("Scholarly description of stellar classification, mass, metallicity, and dynamics"),
      themes: z.array(z.string()).optional().describe("Thematic astrophysical tags (e.g. ['red dwarf', 'multi-planetary', 'habitable zone'])")
    },
    async ({ cosmic_structure_id, name, description, themes }) => {
      try {
        const star_system = await client.createStarSystem({ cosmic_structure_id, name, description, themes });
        return {
          content: [{ type: "text", text: JSON.stringify(star_system, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create star system: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_star_system",
    "Update an existing star system's attributes, cosmic structure, or thematic tags.",
    {
      id: z.number().int().positive().describe("Star System ID"),
      name: z.string().optional().describe("Updated star system name"),
      description: z.string().optional().describe("Updated description"),
      themes: z.array(z.string()).optional().describe("Updated thematic tags"),
      cosmic_structure_id: z.number().int().positive().optional().describe("Reassign to a different cosmic structure ID")
    },
    async ({ id, name, description, themes, cosmic_structure_id }) => {
      try {
        const star_system = await client.updateStarSystem(id, { name, description, themes, cosmic_structure_id });
        return {
          content: [{ type: "text", text: JSON.stringify(star_system, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update star system ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_star_system",
    "Delete a star system and its cascaded celestial bodies.",
    {
      id: z.number().int().positive().describe("Star System ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteStarSystem(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete star system ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_star_systems_batch",
    "Batch insert or update star systems scoped to a specific cosmic structure.",
    {
      cosmic_structure_id: z.number().int().positive().describe("Cosmic Structure ID"),
      star_systems: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            themes: z.array(z.string()).optional()
          })
        )
        .min(1)
        .describe("Array of star systems to upsert")
    },
    async ({ cosmic_structure_id, star_systems }) => {
      try {
        const result = await client.upsertStarSystemsBatch(cosmic_structure_id, star_systems);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to batch upsert star systems: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "generate_star_system_embedding",
    "Calculate 1024-dimensional vector embedding for a star system using the configured embedding model.",
    {
      id: z.number().int().positive().describe("Star System ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for embedding generation to finish")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.generateStarSystemEmbedding(id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to generate embedding for star system ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_star_system_celestial_bodies",
    "Discover and generate celestial bodies (planets, moons) for a star system via LLM extraction.",
    {
      id: z.number().int().positive().describe("Star System ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for celestial body discovery to complete")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.populateStarSystemCelestialBodies(id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate celestial bodies for star system ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_star_systems_bulk",
    "Trigger bulk LLM star system discovery across all cosmic structures or a single cosmic structure.",
    {
      cosmic_structure_id: z.number().int().positive().optional().describe("Optional cosmic structure ID to scope bulk discovery"),
      sync: z.boolean().optional().default(false).describe("If true, wait synchronously for completion")
    },
    async ({ cosmic_structure_id, sync }) => {
      try {
        const result = await client.populateStarSystems(cosmic_structure_id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate star systems in bulk: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
