import type { SearchHit, TreeNode } from "../types";

export function findNodeByPath(
  root: TreeNode,
  segments: string[],
): { node: TreeNode; path: string[] } | null {
  if (segments.length === 0) return { node: root, path: [root.name] };

  let current: TreeNode = root;
  const traversed: string[] = [root.name];

  for (const segment of segments) {
    if (current.type !== "folder") return null;
    const next = current.children.find((child) => child.name === segment);
    if (!next) return null;
    current = next;
    traversed.push(segment);
  }
  return { node: current, path: traversed };
}

export function calculateTotalSize(node: TreeNode): number {
  if (node.type === "file") return node.size;
  let total = 0;
  for (const child of node.children) total += calculateTotalSize(child);
  return total;
}

export function searchTree(root: TreeNode, query: string): SearchHit[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const hits: SearchHit[] = [];
  const walk = (node: TreeNode, path: string[]) => {
    const nextPath = [...path, node.name];
    if (node.name.toLowerCase().includes(needle)) {
      hits.push({ node, path: nextPath });
    }
    if (node.type === "folder") {
      for (const child of node.children) walk(child, nextPath);
    }
  };
  walk(root, []);
  return hits;
}

export function encodeNodePath(segments: string[]): string {
  return segments.map(encodeURIComponent).join("/");
}

export function decodeNodePath(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("/")
    .filter((s) => s.length > 0)
    .map((s) => decodeURIComponent(s));
}
