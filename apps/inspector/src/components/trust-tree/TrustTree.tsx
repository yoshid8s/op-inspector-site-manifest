import { TrustNode } from "../../models/trust-node";
import { TrustTreeNode } from "./TrustTreeNode";

type Props = {
  root: TrustNode;
  onSelect?: (node: TrustNode) => void;
};

export function TrustTree({ root, onSelect }: Props) {
  return (
    <section aria-label="Site Trust Graph" className="w-full">
      <h2 className="mb-3 font-bold">Site Trust Graph</h2>

      <ul>
        <TrustTreeNode node={root} onSelect={onSelect} />
      </ul>
    </section>
  );
}
