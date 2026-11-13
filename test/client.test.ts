import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { AstronomerApiClient, AstronomerApiError } from "../src/client/index.js";

describe("AstronomerApiClient", () => {
  let mock: MockAdapter;
  let client: AstronomerApiClient;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    client = new AstronomerApiClient({
      apiUrl: "http://localhost:3000/api/v1",
      timeoutMs: 5000
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it("fetches platform status successfully", async () => {
    const mockStatus = {
      status: "ok",
      environment: "test",
      timestamp: "2026-11-13T00:00:00Z",
      counts: {
        cosmic_structures: 5,
        star_systems: 120,
        star_systems_embedded: 120,
        celestial_bodies: 840,
        celestial_bodies_embedded: 840,
        cluster_snapshots: 4,
        cluster_reports: 2
      },
      config: {
        embedding_model: "qwen3-embedding:0.6b",
        embedding_api_base: "http://localhost:11434/v1",
        embedding_dimensions: 1024,
        llm_model: "Qwen3.6-35B-A3B-NVFP4",
        llm_api_base: "http://localhost:11434/v1",
        context_window: 262144,
        digest_char_budget: 576716
      }
    };

    mock.onGet("http://localhost:3000/api/v1/status").reply(200, { data: mockStatus });

    const status = await client.getStatus();
    expect(status.status).toBe("ok");
    expect(status.counts.star_systems).toBe(120);
    expect(status.counts.celestial_bodies).toBe(840);
  });

  it("handles 404 not found errors cleanly", async () => {
    mock.onGet("http://localhost:3000/api/v1/star_systems/999").reply(404, {
      error: { code: "not_found", message: "Couldn't find StarSystem with 'id'=999" }
    });

    await expect(client.getStarSystem(999)).rejects.toThrowError(AstronomerApiError);
    try {
      await client.getStarSystem(999);
    } catch (err: any) {
      expect(err.code).toBe("not_found");
      expect(err.status).toBe(404);
      expect(err.message).toContain("Couldn't find StarSystem");
    }
  });

  it("performs unified semantic search", async () => {
    const mockResults = [
      { type: "StarSystem", score: 0.91, data: { id: 1, name: "TRAPPIST-1" } }
    ];

    mock
      .onGet("http://localhost:3000/api/v1/search", {
        params: { q: "habitable zone red dwarf", mode: "semantic", limit: 5 }
      })
      .reply(200, { data: mockResults, meta: { mode: "semantic", count: 1 } });

    const res = await client.search({ q: "habitable zone red dwarf", mode: "semantic", limit: 5 });
    expect(res.data).toEqual(mockResults);
  });

  it("finds star system and celestial body counterparts via neighbors endpoints", async () => {
    const mockStarSystems = [{ id: 2, name: "Proxima Centauri", neighbor_distance: 0.08 }];
    mock
      .onGet("http://localhost:3000/api/v1/star_systems/1/neighbors", {
        params: { limit: 5 }
      })
      .reply(200, { data: mockStarSystems });

    const starSystemNeighbors = await client.getStarSystemNeighbors(1, { limit: 5 });
    expect(starSystemNeighbors).toHaveLength(1);
    expect(starSystemNeighbors[0].name).toBe("Proxima Centauri");

    const mockCelestialBodies = [{ id: 10, name: "Europa", neighbor_distance: 0.06 }];
    mock
      .onGet("http://localhost:3000/api/v1/celestial_bodies/4/neighbors", {
        params: { limit: 5, cosmic_structure_id: 1 }
      })
      .reply(200, { data: mockCelestialBodies });

    const celestialBodyNeighbors = await client.getCelestialBodyNeighbors(4, { limit: 5, cosmic_structure_id: 1 });
    expect(celestialBodyNeighbors).toHaveLength(1);
    expect(celestialBodyNeighbors[0].name).toBe("Europa");
  });

  it("batch upserts celestial bodies for a star system", async () => {
    const mockBodies = [
      { id: 1, star_system_id: 5, name: "TRAPPIST-1e", description: "Habitable terrestrial", themes: ["habitable"] }
    ];

    mock.onPost("http://localhost:3000/api/v1/celestial_bodies/upsert_batch").reply(200, {
      data: mockBodies,
      meta: { star_system_id: 5, count: 1 }
    });

    const res = await client.upsertCelestialBodiesBatch(5, [
      { name: "TRAPPIST-1e", description: "Habitable terrestrial", themes: ["habitable"] }
    ]);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].name).toBe("TRAPPIST-1e");
  });

  it("computes live clustering and manages snapshots & reports", async () => {
    const mockClusters = {
      target_type: "StarSystem",
      level: 5,
      distance_threshold: 0.2,
      full_coverage: false,
      total_embedded_count: 120,
      unembedded_count: 0,
      clusters_count: 10,
      singletons_count: 15,
      largest_cluster_size: 14,
      generated_at: "2026-11-13T00:00:00Z",
      clusters: [],
      singletons: []
    };

    mock
      .onGet("http://localhost:3000/api/v1/clusters", {
        params: { target_type: "StarSystem", level: 5 }
      })
      .reply(200, { data: mockClusters });

    const clusters = await client.computeClusters({ target_type: "StarSystem", level: 5 });
    expect(clusters.clusters_count).toBe(10);
    expect(clusters.distance_threshold).toBe(0.2);

    mock.onDelete("http://localhost:3000/api/v1/cluster_reports/7").reply(200, {
      data: { id: 7, title: "Exoplanet Report", deleted: true }
    });

    const deletedReport = await client.deleteClusterReport(7);
    expect(deletedReport.deleted).toBe(true);
  });
});
