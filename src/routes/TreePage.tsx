import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTreeContext } from "../context/TreeContext";
import {
  decodeNodePath,
  findNodeByPath,
  searchTree,
} from "../lib/treeUtils";
import TreeView from "../components/TreeView";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import Breadcrumbs from "../components/Breadcrumbs";
import FileDetails from "../components/FileDetails";
import FolderDetails from "../components/FolderDetails";

export default function TreePage() {
  const { tree, expandPath } = useTreeContext();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const rawPath = params["*"] ?? "";
  const subSegments = useMemo(() => decodeNodePath(rawPath), [rawPath]);

  const resolved = useMemo(() => {
    if (!tree) return null;
    return findNodeByPath(tree, subSegments);
  }, [tree, subSegments]);

  useEffect(() => {
    if (resolved) expandPath(resolved.path);
  }, [resolved, expandPath]);

  const query = searchParams.get("q") ?? "";
  const hits = useMemo(
    () => (tree && query.trim() ? searchTree(tree, query) : []),
    [tree, query],
  );

  if (!tree) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,360px)_1fr]">
      <aside className="space-y-3">
        <SearchBar />
        {query.trim() ? (
          <SearchResults hits={hits} query={query} />
        ) : (
          <div className="rounded-md border border-slate-200 bg-white p-2">
            <TreeView
              root={tree}
              selectedPath={resolved ? resolved.path : null}
            />
          </div>
        )}
      </aside>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        {resolved ? (
          <div className="space-y-4">
            <Breadcrumbs segments={resolved.path} />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {resolved.node.name}
            </h2>
            {resolved.node.type === "file" ? (
              <FileDetails node={resolved.node} pathSegments={resolved.path} />
            ) : (
              <FolderDetails
                node={resolved.node}
                pathSegments={resolved.path}
              />
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            <p className="mb-2 font-medium text-slate-800">
              Node not found at this path.
            </p>
            <p>
              The path <code className="font-mono">{rawPath || "/"}</code> does
              not exist in the current tree. Use the tree on the left to
              navigate to a valid node.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
