import { TrustNode } from "../../models/trust-node";
import { normalizeUrl } from "./find-linked-element";
import { findObservedContent } from "./find-observed-content";

function getDeclaredUrls(
  document: Document,
  node: TrustNode,
): Set<string> {
  const urls = new Set<string>();

  function walk(current: TrustNode) {
    if (
      current.type === "article" &&
      current.url
    ) {
      const normalized = normalizeUrl(
        current.url,
        document.location.href,
      );

      if (normalized) {
        urls.add(normalized);
      }
    }

    current.children?.forEach(walk);
  }

  walk(node);

  return urls;
}

function markDeclared(node: TrustNode): TrustNode {
  return {
    ...node,
    declaration:
      node.type === "article"
        ? "declared"
        : "unknown",
    children: node.children?.map(markDeclared),
  };
}

export function annotateDeclaration(
  document: Document,
  root: TrustNode,
): TrustNode {
  const declaredRoot = markDeclared(root);
  const declaredUrls = getDeclaredUrls(
    document,
    declaredRoot,
  );

  const undeclared = findObservedContent(document)
    .filter((item) => !declaredUrls.has(item.url))
    .map<TrustNode>((item) => ({
      id: `observed:${item.url}`,
      type: "article",
      title: item.title,
      url: item.url,
      declaration: "undeclared",
      presence: "present",
    }));

  if (undeclared.length === 0) {
    return declaredRoot;
  }

  return {
    ...declaredRoot,
    children: [
      ...(declaredRoot.children ?? []),
      {
        id: "section:undeclared",
        type: "section",
        title: "Observed but undeclared",
        declaration: "unknown",
        children: undeclared,
      },
    ],
  };
}
