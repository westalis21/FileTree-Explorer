import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { FolderNode } from "../types";
import { calculateTotalSize, encodeNodePath } from "../lib/treeUtils";
import { formatBytes } from "../lib/format";

type Props = {
  node: FolderNode;
  pathSegments: string[];
};

export default function FolderDetails({ node, pathSegments }: Props) {
  const totalSize = useMemo(() => calculateTotalSize(node), [node]);

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-[max-content,1fr] gap-x-6 gap-y-3 text-sm">
        <dt className="text-slate-500">Name</dt>
        <dd className="font-medium text-slate-900">{node.name}</dd>

        <dt className="text-slate-500">Type</dt>
        <dd className="text-slate-700">Folder</dd>

        <dt className="text-slate-500">Direct children</dt>
        <dd className="font-mono text-slate-800">{node.children.length}</dd>

        <dt className="text-slate-500">Total size</dt>
        <dd className="font-mono text-slate-800">
          {formatBytes(totalSize)}{" "}
          <span className="text-slate-400">({totalSize} B)</span>
        </dd>

        <dt className="text-slate-500">Path</dt>
        <dd className="break-all font-mono text-slate-800">
          {pathSegments.join(" / ")}
        </dd>
      </dl>

      <section>
        <h3 className="mb-2 text-sm font-medium text-slate-700">Contents</h3>
        {node.children.length === 0 ? (
          <p className="text-sm text-slate-500">(empty folder)</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
            {node.children.map((child) => {
              const childSegments = [...pathSegments, child.name];
              const target = `/tree/${encodeNodePath(childSegments.slice(1))}`;
              return (
                <li key={child.name}>
                  <Link
                    to={target}
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-800">
                      <span>{child.type === "folder" ? "📁" : "📄"}</span>
                      {child.name}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {child.type === "file"
                        ? formatBytes(child.size)
                        : `${child.children.length} items`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
