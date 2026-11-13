import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AstronomerApiClient } from "../client/index.js";
import { registerSearchTools } from "./search.js";
import { registerCosmicStructureTools } from "./cosmic_structures.js";
import { registerStarSystemTools } from "./star_systems.js";
import { registerCelestialBodyTools } from "./celestial_bodies.js";
import { registerClusterTools } from "./clusters.js";
import { registerReportTools } from "./reports.js";
import { registerJobTools } from "./jobs.js";
import { registerSystemTools } from "./system.js";

export function registerAllTools(server: McpServer, client: AstronomerApiClient): void {
  registerSearchTools(server, client);
  registerCosmicStructureTools(server, client);
  registerStarSystemTools(server, client);
  registerCelestialBodyTools(server, client);
  registerClusterTools(server, client);
  registerReportTools(server, client);
  registerJobTools(server, client);
  registerSystemTools(server, client);
}
