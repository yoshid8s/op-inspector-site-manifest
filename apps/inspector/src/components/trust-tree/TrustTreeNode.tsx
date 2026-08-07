import { TrustNode } from "../../models/trust-node";

type Props = {
  node: TrustNode;
  depth?: number;
};

function getMarker(node: TrustNode) {
  if (node.children && node.children.length > 0) {
    return "▾";
  }

  return "•";
}

export function TrustTreeNode({
  node,
  depth = 0,
}: Props) {
  return (
    <li>
      <div
        className="flex items-start gap-2 py-1"
        style={{
          paddingLeft: `${depth * 16}px`,
        }}
      >
        <span
          aria-hidden="true"
          className="shrink-0 text-gray-500"
        >
          {getMarker(node)}
        </span>

        <span className="min-w-0 break-words">
          {node.title}
        </span>
      </div>

      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TrustTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
