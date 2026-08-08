import { useState } from "react";
import { TrustNode } from "../../models/trust-node";

type Props = {
  node: TrustNode;
  depth?: number;
  onSelect?: (node: TrustNode) => void;
};

export function TrustTreeNode({ node, depth = 0, onSelect }: Props) {
  const hasChildren = Boolean(node.children && node.children.length > 0);

  const isRoot = depth === 0;

  const canToggle = !isRoot && node.type === "section" && hasChildren;

  const [isExpanded, setIsExpanded] = useState(true);

  const showChildren = hasChildren && (isRoot || !canToggle || isExpanded);

  return (
    <li>
      <div
        className="flex items-start gap-1.5 py-1 rounded"
        style={{
          paddingLeft: `${depth * 12}px`,
        }}
      >
        {canToggle ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? `Collapse ${node.title}` : `Expand ${node.title}`
            }
            className="shrink-0 w-4 text-gray-500 cursor-pointer"
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : hasChildren ? (
          <span aria-hidden="true" className="shrink-0 w-4 text-gray-500">
            ▾
          </span>
        ) : (
          <span aria-hidden="true" className="shrink-0 w-4 text-gray-400">
            •
          </span>
        )}

        {node.type === "article" ? (
          <button
            type="button"
            className="min-w-0 break-words text-left cursor-pointer"
            onClick={() => onSelect?.(node)}
          >
            {node.title}
          </button>
        ) : (
          <span className="min-w-0 break-words">{node.title}</span>
        )}
      </div>

      {showChildren && (
        <ul>
          {node.children?.map((child) => (
            <TrustTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
