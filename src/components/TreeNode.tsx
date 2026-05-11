import { Link } from "react-router-dom";
import type { TreeNode } from "../types";
import { useTreeContext } from "../context/TreeContext";
import { encodeNodePath } from "../lib/treeUtils";

type Props = {
  node: TreeNode;
  pathSegments: string[];
  depth: number;
  selectedKey: string | null;
};

export default function TreeNodeRow({
  node,
  pathSegments,
  depth,
  selectedKey,
}: Props) {
  const { expanded, toggleExpanded } = useTreeContext();
  const key = pathSegments.join("/");
  const isExpanded = expanded.has(key);
  const isSelected = selectedKey === key;

  const indentPx = depth * 16;
  const linkTarget =
    pathSegments.length <= 1
      ? "/tree"
      : `/tree/${encodeNodePath(pathSegments.slice(1))}`;

  return (
    <li>
      <div
        className={`group flex items-center gap-1 rounded-md py-1 pr-2 ${
          isSelected ? "bg-indigo-100" : "hover:bg-slate-100"
        }`}
        style={{ paddingLeft: indentPx + 4 }}
      >
        {node.type === "folder" ? (
          <button
            type="button"
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            onClick={() => toggleExpanded(key)}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-200"
          >
            <span
              className={`inline-block transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
          </button>
        ) : (
          <span className="inline-block h-5 w-5" />
        )}

        <span className="select-none text-sm">
          {node.type === "folder" ? "📁" : "📄"}
        </span>

        <Link
          to={linkTarget}
          className={`flex-1 truncate rounded px-1 text-sm ${
            isSelected
              ? "font-medium text-indigo-700"
              : "text-slate-800 hover:text-indigo-700"
          }`}
        >
          {node.name}
        </Link>

        {node.type === "file" && (
          <span className="font-mono text-xs text-slate-400">{node.size}B</span>
        )}
      </div>

      {node.type === "folder" && isExpanded && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNodeRow
              key={`${key}/${child.name}`}
              node={child}
              pathSegments={[...pathSegments, child.name]}
              depth={depth + 1}
              selectedKey={selectedKey}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
