import { Link } from "react-router-dom";
import type { SearchHit } from "../types";
import { encodeNodePath } from "../lib/treeUtils";

type Props = {
  hits: SearchHit[];
  query: string;
};

export default function SearchResults({ hits, query }: Props) {
  if (!query.trim()) return null;

  if (hits.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-500">
        No matches for <span className="font-medium">“{query}”</span>.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {hits.length} {hits.length === 1 ? "match" : "matches"} for “{query}”
      </div>
      <ul className="max-h-96 divide-y divide-slate-100 overflow-auto">
        {hits.map((hit) => {
          const linkTarget =
            hit.path.length <= 1
              ? "/tree"
              : `/tree/${encodeNodePath(hit.path.slice(1))}`;
          return (
            <li key={hit.path.join("/")}>
              <Link
                to={linkTarget}
                className="block px-3 py-2 hover:bg-slate-50"
              >
                <div className="text-sm text-slate-800">
                  {hit.node.type === "folder" ? "📁" : "📄"} {hit.node.name}
                </div>
                <div className="font-mono text-xs text-slate-500">
                  {hit.path.join(" / ")}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
