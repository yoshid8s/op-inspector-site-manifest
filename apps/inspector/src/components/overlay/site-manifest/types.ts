export type SiteManifestItem = {
  position: number;
  role: string;
  headline: string;
  url: string;
  casUrl: string;
};

export type SiteManifest = {
  site: string;
  page: string;
  generatedAt: string;
  items: SiteManifestItem[];
};

export function isSiteManifest(value: unknown): value is SiteManifest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const manifest = value as Partial<SiteManifest>;

  return (
    typeof manifest.site === "string" &&
    typeof manifest.page === "string" &&
    Array.isArray(manifest.items) &&
    manifest.items.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.position === "number" &&
        typeof item.role === "string" &&
        typeof item.url === "string" &&
        typeof item.casUrl === "string",
    )
  );
}
