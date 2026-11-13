# Astronomer Model Context Protocol (MCP) Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.32.2-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A Model Context Protocol (MCP) server providing deep LLM-agent tool and resource integration with **[Astronomer](https://github.com/leouofa/astronomer)** — an open-source computational research platform and quantitative analytical laboratory for comparative astrophysics, stellar systems, and celestial body manifolds.

---

## Overview

The `astronomer-mcp` server enables AI agents (Claude Code, Cursor, Gemini CLI, etc.) to query, manipulate, cluster, and synthesize the astrophysics domain models directly over standard input/output (`stdio`):

- **51 Registered MCP Tools** across 8 functional modules (Search, Cosmic Structures, Star Systems, Celestial Bodies, Clustering, Synthesis Reports, Background Jobs, and System Diagnostics).
- **4 Registered MCP Resources** exposing read-only live platform status, catalogs, cluster snapshots, and markdown monographs.
- **2 MCP Prompt Templates** for comparative astrophysics studies and cluster synthesis monographs.
- **1024-dimensional semantic manifold** querying via PostgreSQL `pgvector` HNSW indexes.

---

## Architectural Mapping

| Tier / Domain | Model | Table Name | MCP Module / Tools |
|---|---|---|---|
| **Tier 1** | Galaxies & Clusters | `cosmic_structures` | `list_cosmic_structures`, `get_cosmic_structure`, `create_cosmic_structure`, `update_cosmic_structure`, `delete_cosmic_structure`, `upsert_cosmic_structures_batch`, `populate_cosmic_structures`, `populate_cosmic_structure_star_systems` |
| **Tier 2** | Star Systems | `star_systems` | `list_star_systems`, `get_star_system`, `create_star_system`, `update_star_system`, `delete_star_system`, `upsert_star_systems_batch`, `generate_star_system_embedding`, `populate_star_system_celestial_bodies`, `populate_star_systems_bulk` |
| **Tier 3** | Planets & Celestial Bodies | `celestial_bodies` | `list_celestial_bodies`, `get_celestial_body`, `create_celestial_body`, `update_celestial_body`, `delete_celestial_body`, `upsert_celestial_bodies_batch`, `generate_celestial_body_embedding`, `populate_celestial_bodies_bulk` |
| **Clustering** | 15-Level Agglomerative | `cluster_snapshots`, `cluster_groups` | `compute_clusters`, `create_cluster_snapshot`, `list_cluster_snapshots`, `get_cluster_snapshot`, `delete_cluster_snapshot`, `list_cluster_groups`, `get_cluster_group` |
| **Synthesis** | Multi-Stage Map-Reduce | `cluster_reports`, `cluster_report_summaries` | `list_cluster_reports`, `get_cluster_report`, `create_cluster_report`, `delete_cluster_report`, `generate_deep_synthesis`, `list_report_summaries`, `get_report_summary`, `list_report_sub_reports`, `get_report_sub_report` |
| **Global Search** | Cross-Catalog pgvector | Multi-table | `search`, `find_counterparts` |
| **Platform** | Jobs & System Info | Multi-service | `list_jobs`, `get_job_status`, `wait_for_job`, `get_platform_status`, `get_settings`, `update_context_window`, `trigger_bulk_embeddings`, `get_openapi_spec` |

---

## Installation & Setup

### Prerequisites
- Node.js 20+
- Running instance of [Astronomer](https://github.com/leouofa/astronomer) (`http://localhost:3000`)

### Build
```bash
git clone https://github.com/leouofa/astronomer-mcp.git
cd astronomer-mcp
npm install
npm run build
```

---

## Configuration

### Environment Variables
Configure via `.env` file or export in your shell:

```bash
# Base URL for the Astronomer Rails API (v1)
ASTRONOMER_API_URL=http://localhost:3000/api/v1

# Optional API key if authentication is enabled
# ASTRONOMER_API_KEY=

# HTTP request timeout in milliseconds (default: 60000)
ASTRONOMER_TIMEOUT_MS=60000
```

### CLI Arguments
```bash
astronomer-mcp [options]

Options:
  -u, --url <url>        Astronomer API base URL (default: http://localhost:3000/api/v1)
  -k, --api-key <key>    Optional API key / Bearer token
  -t, --timeout <ms>     Request timeout in milliseconds (default: 60000)
  -h, --help             Display help message
```

---

## MCP Client Configuration

### Claude Desktop / Antigravity / Cursor Configuration
Add to your client configuration (e.g. `claude_desktop_config.json` or MCP settings):

```json
{
  "mcpServers": {
    "astronomer": {
      "command": "node",
      "args": ["/path/to/astronomer-mcp/dist/index.js"],
      "env": {
        "ASTRONOMER_API_URL": "http://localhost:3000/api/v1"
      }
    }
  }
}
```

---

## Testing

Run the Vitest test suite:
```bash
npm test
```

---

## License

This project is licensed under the [MIT License](LICENSE).
