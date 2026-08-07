import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveSiteManifest } from "./site-manifest-resolver";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveSiteManifest", () => {
  it("builds a hierarchical TrustNode tree from a Site Manifest", async () => {
    const manifest = {
      site: "https://example.com/",
      page: "https://example.com/",
      generatedAt: "2026-08-07T00:00:00.000Z",
      items: [
        {
          position: 1,
          role: "featured",
          headline: "Featured Article",
          url: "https://example.com/featured/",
          casUrl: "https://example.com/cas/featured.json",
        },
        {
          position: 2,
          role: "daily-style",
          headline: "Daily Article 1",
          url: "https://example.com/daily-1/",
          casUrl: "https://example.com/cas/daily-1.json",
        },
        {
          position: 3,
          role: "daily-style",
          headline: "Daily Article 2",
          url: "https://example.com/daily-2/",
          casUrl: "https://example.com/cas/daily-2.json",
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => manifest,
      }),
    );

    const resolved = await resolveSiteManifest(
      "https://example.com/site-manifest.json",
    );

    expect(resolved).not.toBeNull();

    expect(resolved?.root).toEqual({
      id: "manifest:https://example.com/",
      type: "manifest",
      title: "Site Manifest",
      url: "https://example.com/",
      children: [
        {
          id: "section:featured",
          type: "section",
          title: "featured",
          children: [
            {
              id: "article:https://example.com/featured/",
              type: "article",
              title: "Featured Article",
              url: "https://example.com/featured/",
              casUrl: "https://example.com/cas/featured.json",
            },
          ],
        },
        {
          id: "section:daily-style",
          type: "section",
          title: "daily-style",
          children: [
            {
              id: "article:https://example.com/daily-1/",
              type: "article",
              title: "Daily Article 1",
              url: "https://example.com/daily-1/",
              casUrl: "https://example.com/cas/daily-1.json",
            },
            {
              id: "article:https://example.com/daily-2/",
              type: "article",
              title: "Daily Article 2",
              url: "https://example.com/daily-2/",
              casUrl: "https://example.com/cas/daily-2.json",
            },
          ],
        },
      ],
    });
  });

  it("returns null when the external resource is not a Site Manifest", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ hello: "world" }),
      }),
    );

    const resolved = await resolveSiteManifest(
      "https://example.com/not-a-manifest.json",
    );

    expect(resolved).toBeNull();
  });
});
