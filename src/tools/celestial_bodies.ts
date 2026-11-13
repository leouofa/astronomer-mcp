import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AstronomerApiClient } from "../client/index.js";

export function registerCelestialBodyTools(server: McpServer, client: AstronomerApiClient): void {
  server.tool(
    "list_celestial_bodies",
    "List and filter celestial bodies (exoplanets, moons, dwarf planets) with physical/orbital themes and embedding metadata.",
    {
      star_system_id: z.number().int().positive().optional().describe("Filter by star system ID"),
      cosmic_structure_id: z.number().int().positive().optional().describe("Filter by cosmic structure ID"),
      theme: z.string().optional().describe("Filter celestial bodies containing thematic tag (e.g. 'tidally locked', 'ocean world', 'gas giant')"),
      q: z.string().optional().describe("Keyword search across celestial body name, description, or star system name"),
      embedded: z.boolean().optional().describe("Filter by whether vector embedding has been generated"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-float vector array"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async (params) => {
      try {
        const result = await client.listCelestialBodies(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list celestial bodies: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_celestial_body",
    "Retrieve details of a celestial body including its structured themes and associated star system/cosmic structure.",
    {
      id: z.number().int().positive().describe("Celestial Body ID"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-dim vector embedding")
    },
    async ({ id, include_embedding }) => {
      try {
        const celestial_body = await client.getCelestialBody(id, { include_embedding });
        return {
          content: [{ type: "text", text: JSON.stringify(celestial_body, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get celestial body ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_celestial_body",
    "Create a new celestial body record associated with a star system.",
    {
      star_system_id: z.number().int().positive().describe("Star System ID"),
      name: z.string().min(1).describe("Name of the celestial body (e.g. 'TRAPPIST-1e', 'Europa')"),
      description: z.string().optional().describe("Description of physical characteristics, orbital radius, atmosphere, and composition"),
      themes: z.array(z.string()).optional().describe("Thematic planetary tags (e.g. ['habitable zone', 'rocky terrestrial', 'water vapor'])")
    },
    async ({ star_system_id, name, description, themes }) => {
      try {
        const celestial_body = await client.createCelestialBody({ star_system_id, name, description, themes });
        return {
          content: [{ type: "text", text: JSON.stringify(celestial_body, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create celestial body: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_celestial_body",
    "Update an existing celestial body's attributes, star system, or thematic tags.",
    {
      id: z.number().int().positive().describe("Celestial Body ID"),
      name: z.string().optional().describe("Updated celestial body name"),
      description: z.string().optional().describe("Updated description"),
      themes: z.array(z.string()).optional().describe("Updated thematic tags"),
      star_system_id: z.number().int().positive().optional().describe("Reassign to a different star system ID")
    },
    async ({ id, name, description, themes, star_system_id }) => {
      try {
        const celestial_body = await client.updateCelestialBody(id, { name, description, themes, star_system_id });
        return {
          content: [{ type: "text", text: JSON.stringify(celestial_body, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update celestial body ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_celestial_body",
    "Delete a celestial body record.",
    {
      id: z.number().int().positive().describe("Celestial Body ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteCelestialBody(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete celestial body ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_celestial_bodies_batch",
    "Batch insert or update celestial bodies scoped to a specific star system.",
    {
      star_system_id: z.number().int().positive().describe("Star System ID"),
      celestial_bodies: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            themes: z.array(z.string()).optional()
          })
        )
        .min(1)
        .describe("Array of celestial bodies to upsert")
    },
    async ({ star_system_id, celestial_bodies }) => {
      try {
        const result = await client.upsertCelestialBodiesBatch(star_system_id, celestial_bodies);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to batch upsert celestial bodies: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "generate_celestial_body_embedding",
    "Calculate 1024-dimensional vector embedding for a celestial body record.",
    {
      id: z.number().int().positive().describe("Celestial Body ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for embedding generation to finish")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.generateCelestialBodyEmbedding(id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to generate embedding for celestial body ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_celestial_bodies_bulk",
    "Trigger bulk LLM celestial body discovery across all star systems or a single star system.",
    {
      star_system_id: z.number().int().positive().optional().describe("Optional star system ID to scope discovery"),
      sync: z.boolean().optional().default(false).describe("If true, wait synchronously for completion")
    },
    async ({ star_system_id, sync }) => {
      try {
        const result = await client.populateCelestialBodies(star_system_id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to bulk populate celestial bodies: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
