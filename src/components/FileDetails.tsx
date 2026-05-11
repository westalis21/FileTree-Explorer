import type { FileNode } from "../types";
import { formatBytes } from "../lib/format";

type Props = {
  node: FileNode;
  pathSegments: string[];
};

export default function FileDetails({ node, pathSegments }: Props) {
  return (
    <dl className="grid grid-cols-[max-content,1fr] gap-x-6 gap-y-3 text-sm">
      <dt className="text-slate-500">Name</dt>
      <dd className="font-medium text-slate-900">{node.name}</dd>

      <dt className="text-slate-500">Type</dt>
      <dd className="text-slate-700">File</dd>

      <dt className="text-slate-500">Size</dt>
      <dd className="font-mono text-slate-800">
        {formatBytes(node.size)}{" "}
        <span className="text-slate-400">({node.size} B)</span>
      </dd>

      <dt className="text-slate-500">Path</dt>
      <dd className="break-all font-mono text-slate-800">
        {pathSegments.join(" / ")}
      </dd>
    </dl>
  );
}
