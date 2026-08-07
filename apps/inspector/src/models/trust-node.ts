export type TrustNodeType =
  | "site"
  | "manifest"
  | "section"
  | "article"
  | "paragraph"
  | "advertisement";

export interface TrustNode {
  id: string;
  type: TrustNodeType;
  title: string;
  url?: string;
  casUrl?: string;
  verified?: boolean;
  lazy?: boolean;
  children?: TrustNode[];
}
