import { z } from "zod";
import type { TreeNode } from "../types";

const fileSchema = z.object({
  name: z.string().min(1, "File name must not be empty"),
  type: z.literal("file"),
  size: z.number().int().nonnegative(),
});

type FileShape = z.infer<typeof fileSchema>;

type FolderShape = {
  name: string;
  type: "folder";
  children: Array<FileShape | FolderShape>;
};

const folderSchema: z.ZodType<FolderShape> = z.lazy(() =>
  z.object({
    name: z.string().min(1, "Folder name must not be empty"),
    type: z.literal("folder"),
    children: z.array(z.union([fileSchema, folderSchema])),
  }),
);

export const treeSchema: z.ZodType<TreeNode> = z.union([
  fileSchema,
  folderSchema,
]);

export function parseTreeJson(raw: string): TreeNode {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  const result = treeSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join(".") || "(root)";
    throw new Error(`Schema error at ${path}: ${issue?.message ?? "unknown"}`);
  }
  return result.data;
}
