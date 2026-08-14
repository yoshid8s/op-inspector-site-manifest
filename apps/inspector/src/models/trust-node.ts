export type TrustNodePresence = "unknown" | "present" | "missing";

export type TrustNodeType =
  | "site"
  | "manifest"
  | "section"
  | "article"
  | "paragraph"
  | "advertisement";

export type TrustNodeDeclaration = "unknown" | "declared" | "undeclared";

export interface TrustNode {
  id: string;
  type: TrustNodeType;
  title: string;
  url?: string;
  casUrl?: string;

  presence?: TrustNodePresence;

  verified?: boolean;
  lazy?: boolean;
  children?: TrustNode[];
  declaration?: TrustNodeDeclaration;
}
