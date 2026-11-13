import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.prompt(
    "comparative_astrophysics_analysis",
    "Prompt template for comparing two star systems or celestial bodies across cosmic structures using astrophysical attributes, orbital dynamics, and semantic manifold distance.",
    {
      entity_a: z.string().describe("First star system or celestial body name (e.g. 'TRAPPIST-1' or 'TRAPPIST-1e')"),
      entity_b: z.string().describe("Second star system or celestial body name (e.g. 'Proxima Centauri' or 'Proxima Centauri b')"),
      entity_type: z
        .enum(["star_system", "celestial_body"])
        .optional()
        .default("star_system")
        .describe("Entity type to compare: star_system or celestial_body (default: star_system)"),
      focus_theme: z
        .string()
        .optional()
        .describe("Optional thematic lens (e.g. 'habitable zone atmospheric retention', 'red dwarf flare activity', 'orbital resonance chains')")
    },
    ({ entity_a, entity_b, entity_type = "star_system", focus_theme }) => {
      const themeInstruction = focus_theme
        ? `Focus specifically through the thematic lens of: "${focus_theme}".`
        : "Analyze shared stellar/planetary evolution, orbital dynamics, physical composition, and structural archetype convergence.";

      const detailTool = entity_type === "celestial_body" ? "get_celestial_body" : "get_star_system";

      return {
        description: `Comparative astrophysics analysis of ${entity_a} vs. ${entity_b}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Please conduct a rigorous comparative astrophysics and planetary science analysis between ${entity_a} and ${entity_b} (${entity_type}) using the Astronomer computational framework.\n\n` +
                `1. Query Astronomer using the 'search' and '${detailTool}' tools to retrieve their structured profiles, thematic tags, and galactic/stellar context.\n` +
                `2. Use 'find_counterparts' (entity_type='${entity_type}') to examine where each falls on the 1024-dimensional pgvector cosine distance manifold.\n` +
                `3. ${themeInstruction}\n` +
                `4. Cite specific thematic tags, physical parameters, cosine distances, and cross-structure evolutionary parallels.`
            }
          }
        ]
      };
    }
  );

  server.prompt(
    "astrophysical_cluster_synthesis",
    "Prompt template to draft an academic astrophysical treatise based on Astronomer archetype clusters and frozen snapshots.",
    {
      snapshot_id: z.string().describe("ID of the frozen cluster snapshot to synthesize"),
      thematic_prompt: z.string().describe("Astrophysical or planetary research inquiry to address")
    },
    ({ snapshot_id, thematic_prompt }) => {
      return {
        description: `Astrophysical synthesis based on Snapshot #${snapshot_id}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `You are an expert astrophysicist and planetary scientist specializing in stellar evolution, exoplanet demographics, and galactic dynamics.\n\n` +
                `Research Inquiry: "${thematic_prompt}"\n\n` +
                `1. Inspect cluster snapshot #${snapshot_id} using 'get_cluster_snapshot' or resource 'astronomer://snapshots/${snapshot_id}'.\n` +
                `2. Examine the discovered archetype cluster groups, shared themes, and constituent star systems or celestial bodies.\n` +
                `3. Check if any synthesis reports exist via 'list_cluster_reports' or initiate a new report via 'create_cluster_report' (and optionally 'generate_deep_synthesis').\n` +
                `4. Compose an academic monograph synthesizing the cross-galactic patterns with formal citations to cluster numbers and member objects.`
            }
          }
        ]
      };
    }
  );
}
