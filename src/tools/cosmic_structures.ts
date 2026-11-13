import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AstronomerApiClient } from "../client/index.js";

export function registerCosmicStructureTools(server: McpServer, client: AstronomerApiClient): void {
  server.tool(
    "list_cosmic_structures",
    "List cosmic structures (galaxies, dwarf galaxies, galaxy clusters) registered in Astronomer with star system counts.",
    {
      q: z.string().optional().describe("Filter cosmic structures by name or description substring"),
      include_star_systems: z.boolean().optional().default(false).describe("Include star systems associated with each cosmic structure"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async ({ q, include_star_systems, limit, offset }) => {
      try {
        const result = await client.listCosmicStructures({ q, include_star_systems, limit, offset });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list cosmic structures: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_cosmic_structure",
    "Retrieve details of a single cosmic structure (galaxy/cluster) including its star systems.",
    {
      id: z.number().int().positive().describe("Cosmic Structure ID"),
      include_star_systems: z.boolean().optional().default(true).describe("Include star systems belonging to this cosmic structure")
    },
    async ({ id, include_star_systems }) => {
      try {
        const cosmic_structure = await client.getCosmicStructure(id, { include_star_systems });
        return {
          content: [{ type: "text", text: JSON.stringify(cosmic_structure, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get cosmic structure ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_cosmic_structure",
    "Create a new cosmic structure (galaxy or cluster) record in the catalog.",
    {
      name: z.string().min(1).describe("Name of the cosmic structure (e.g. 'Milky Way', 'Andromeda Galaxy M31')"),
      description: z.string().optional().describe("Astrophysical, morphological, and extragalactic description")
    },
    async ({ name, description }) => {
      try {
        const cosmic_structure = await client.createCosmicStructure({ name, description });
        return {
          content: [{ type: "text", text: JSON.stringify(cosmic_structure, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create cosmic structure: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_cosmic_structure",
    "Update an existing cosmic structure's name or description.",
    {
      id: z.number().int().positive().describe("Cosmic Structure ID"),
      name: z.string().optional().describe("Updated cosmic structure name"),
      description: z.string().optional().describe("Updated description")
    },
    async ({ id, name, description }) => {
      try {
        const cosmic_structure = await client.updateCosmicStructure(id, { name, description });
        return {
          content: [{ type: "text", text: JSON.stringify(cosmic_structure, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update cosmic structure ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_cosmic_structure",
    "Delete a cosmic structure and its cascaded star systems and celestial bodies.",
    {
      id: z.number().int().positive().describe("Cosmic Structure ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteCosmicStructure(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete cosmic structure ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_cosmic_structures_batch",
    "Batch insert or update cosmic structures matching case-insensitively on name.",
    {
      cosmic_structures: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional()
          })
        )
        .min(1)
        .describe("Array of cosmic structures to upsert")
    },
    async ({ cosmic_structures }) => {
      try {
        const result = await client.upsertCosmicStructuresBatch(cosmic_structures);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to upsert cosmic structures: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_cosmic_structures",
    "Trigger LLM discovery to populate major galaxies and galaxy clusters with astrophysical descriptions.",
    {
      sync: z.boolean().optional().default(false).describe("If true, wait synchronously for discovery to complete")
    },
    async ({ sync }) => {
      try {
        const result = await client.populateCosmicStructures(sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate cosmic structures: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_cosmic_structure_star_systems",
    "Discover and populate star systems for a specific cosmic structure via LLM generation.",
    {
      id: z.number().int().positive().describe("Cosmic Structure ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for star system discovery to finish")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.populateCosmicStructureStarSystems(id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate star systems for cosmic structure ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
