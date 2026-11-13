# Changelog

All notable changes to `astronomer-mcp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-13

### Added
- Initial release of `astronomer-mcp` Model Context Protocol server.
- Full 51-tool suite mirroring the 3-tier comparative astrophysics architecture:
  - Global Search (2 tools): `search`, `find_counterparts`
  - Cosmic Structures / Galaxies & Clusters (8 tools): `list_cosmic_structures`, `get_cosmic_structure`, `create_cosmic_structure`, `update_cosmic_structure`, `delete_cosmic_structure`, `upsert_cosmic_structures_batch`, `populate_cosmic_structures`, `populate_cosmic_structure_star_systems`
  - Star Systems (9 tools): `list_star_systems`, `get_star_system`, `create_star_system`, `update_star_system`, `delete_star_system`, `upsert_star_systems_batch`, `generate_star_system_embedding`, `populate_star_system_celestial_bodies`, `populate_star_systems_bulk`
  - Celestial Bodies / Planets & Moons (8 tools): `list_celestial_bodies`, `get_celestial_body`, `create_celestial_body`, `update_celestial_body`, `delete_celestial_body`, `upsert_celestial_bodies_batch`, `generate_celestial_body_embedding`, `populate_celestial_bodies_bulk`
  - Clusters & Snapshots (7 tools): `compute_clusters`, `create_cluster_snapshot`, `list_cluster_snapshots`, `get_cluster_snapshot`, `delete_cluster_snapshot`, `list_cluster_groups`, `get_cluster_group`
  - Synthesis Reports (9 tools): `list_cluster_reports`, `get_cluster_report`, `create_cluster_report`, `delete_cluster_report`, `generate_deep_synthesis`, `list_report_summaries`, `get_report_summary`, `list_report_sub_reports`, `get_report_sub_report`
  - ActiveJob / Background Tasks (3 tools): `list_jobs`, `get_job_status`, `wait_for_job`
  - System, Status & Configuration (5 tools): `get_platform_status`, `get_settings`, `update_context_window`, `trigger_bulk_embeddings`, `get_openapi_spec`
- 4 MCP Resources: `astronomer://status`, `astronomer://cosmic-structures`, `astronomer://snapshots/{id}`, `astronomer://reports/{id}`
- 2 MCP Prompts: `comparative_astrophysics_analysis`, `astrophysical_cluster_synthesis`
- Typed HTTP Client (`AstronomerApiClient`) with error mapping (`AstronomerApiError`) and polling support.
- Complete Vitest test suite.
