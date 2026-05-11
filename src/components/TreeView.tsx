import type { TreeNode } from "../types";
import TreeNodeRow from "./TreeNode";

type Props = {
  root: TreeNode;
  selectedPath: string[] | null;
};

export default function TreeView({ root, selectedPath }: Props) {
  const selectedKey = selectedPath ? selectedPath.join("/") : null;
  return (
    <ul className="text-sm">
      <TreeNodeRow
        node={root}
        pathSegments={[root.name]}
        depth={0}
        selectedKey={selectedKey}
      />
    </ul>
  );
}
