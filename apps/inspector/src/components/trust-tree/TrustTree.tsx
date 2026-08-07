import { TrustNode } from "../../models/trust-node";
import { TrustTreeNode } from "./TrustTreeNode";

type Props = {
  root: TrustNode;
};

export function TrustTree({
  root,
}: Props) {
  return (
    <section
      aria-label="Site Trust Graph"
      className="w-full"
    >
      <h2 className="mb-3 font-bold">
        Site Trust Graph
      </h2>

      <ul>
        <TrustTreeNode node={root} />
      </ul>
    </section>
  );
}
