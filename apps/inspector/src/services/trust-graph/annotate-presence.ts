import {
  TrustNode,
  TrustNodePresence,
} from "../../models/trust-node";
import { findLinkedElement } from "./find-linked-element";

function resolvePresence(
  document: Document,
  node: TrustNode,
): TrustNodePresence {
  if (node.type !== "article" || !node.url) {
    return "unknown";
  }

  return findLinkedElement(document, node.url)
    ? "present"
    : "missing";
}

export function annotatePresence(
  document: Document,
  node: TrustNode,
): TrustNode {
  return {
    ...node,
    presence: resolvePresence(document, node),
    children: node.children?.map((child) =>
      annotatePresence(document, child),
    ),
  };
}
