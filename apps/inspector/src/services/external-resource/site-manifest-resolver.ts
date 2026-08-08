import { TrustNode } from "../../models/trust-node";
import {
  isSiteManifest,
  SiteManifest,
} from "../../components/overlay/site-manifest/types";

export interface ResolvedSiteManifest {
  manifest: SiteManifest;
  root: TrustNode;
}

function createArticleNode(
  item: SiteManifest["items"][number],
): TrustNode {
  return {
    id: `article:${item.url}`,
    type: "article",
    title: item.headline,
    url: item.url,
    casUrl: item.casUrl,
  };
}

export async function resolveSiteManifest(
  resourceUrl: string,
): Promise<ResolvedSiteManifest | null> {
  const response = await fetch(resourceUrl);

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();

  if (!isSiteManifest(payload)) {
    return null;
  }

  const sections = new Map<string, TrustNode[]>();

  for (const item of payload.items) {
    const articles = sections.get(item.role) ?? [];

    articles.push(createArticleNode(item));
    sections.set(item.role, articles);
  }

  const sectionNodes: TrustNode[] = Array.from(
    sections.entries(),
  ).map(([role, children]) => ({
    id: `section:${role}`,
    type: "section",
    title: role,
    children,
  }));

  const root: TrustNode = {
    id: `manifest:${payload.page}`,
    type: "manifest",
    title: "Site Manifest",
    url: payload.page,
    children: sectionNodes,
  };

  return {
    manifest: payload,
    root,
  };
}
