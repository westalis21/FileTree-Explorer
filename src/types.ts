export type FileNode = {
  name: string;
  type: "file";
  size: number;
};

export type FolderNode = {
  name: string;
  type: "folder";
  children: TreeNode[];
};

export type TreeNode = FileNode | FolderNode;

export type SearchHit = {
  node: TreeNode;
  path: string[];
};
