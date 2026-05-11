import { Link } from "react-router-dom";
import { encodeNodePath } from "../lib/treeUtils";

type Props = {
  segments: string[];
};

export default function Breadcrumbs({ segments }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        {segments.map((segment, idx) => {
          const isLast = idx === segments.length - 1;
          const target =
            idx === 0 ? "/tree" : `/tree/${encodeNodePath(segments.slice(1, idx + 1))}`;
          return (
            <li key={`${segment}-${idx}`} className="flex items-center gap-1">
              {idx > 0 && <span className="text-slate-300">/</span>}
              {isLast ? (
                <span className="font-medium text-slate-800">{segment}</span>
              ) : (
                <Link to={target} className="hover:text-indigo-600">
                  {segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
