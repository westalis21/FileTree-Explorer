import { describe, expect, it } from "vitest";
import type { TreeNode } from "../types";
import {
  calculateTotalSize,
  decodeNodePath,
  encodeNodePath,
  findNodeByPath,
  searchTree,
} from "./treeUtils";

const sample: TreeNode = {
  name: "root",
  type: "folder",
  children: [
    {
      name: "src",
      type: "folder",
      children: [
        { name: "index.ts", type: "file", size: 1024 },
        {
          name: "components",
          type: "folder",
          children: [{ name: "Button.tsx", type: "file", size: 512 }],
        },
      ],
    },
    { name: "package.json", type: "file", size: 300 },
  ],
};

describe("findNodeByPath", () => {
  it("returns root for empty segments", () => {
    const res = findNodeByPath(sample, []);
    expect(res?.node).toBe(sample);
    expect(res?.path).toEqual(["root"]);
  });

  it("finds a nested file", () => {
    const res = findNodeByPath(sample, ["src", "components", "Button.tsx"]);
    expect(res?.node.name).toBe("Button.tsx");
    expect(res?.path).toEqual(["root", "src", "components", "Button.tsx"]);
  });

  it("returns null when a segment is missing", () => {
    expect(findNodeByPath(sample, ["src", "missing"])).toBeNull();
  });

  it("returns null when descending into a file", () => {
    expect(findNodeByPath(sample, ["package.json", "anything"])).toBeNull();
  });
});

describe("calculateTotalSize", () => {
  it("sums sizes recursively", () => {
    expect(calculateTotalSize(sample)).toBe(1024 + 512 + 300);
  });

  it("returns 0 for an empty folder", () => {
    expect(
      calculateTotalSize({ name: "x", type: "folder", children: [] }),
    ).toBe(0);
  });

  it("returns size for a single file", () => {
    expect(calculateTotalSize({ name: "x", type: "file", size: 42 })).toBe(42);
  });
});

describe("searchTree", () => {
  it("returns an empty array for empty query", () => {
    expect(searchTree(sample, "")).toEqual([]);
    expect(searchTree(sample, "   ")).toEqual([]);
  });

  it("matches by partial case-insensitive name", () => {
    const hits = searchTree(sample, "BUTTON");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.path).toEqual([
      "root",
      "src",
      "components",
      "Button.tsx",
    ]);
  });

  it("returns multiple hits including folders", () => {
    const hits = searchTree(sample, "s");
    const names = hits.map((h) => h.node.name);
    expect(names).toContain("src");
    expect(names).toContain("components");
    expect(names).toContain("index.ts");
  });
});

describe("encode/decode node path", () => {
  it("round-trips segments with special characters", () => {
    const segments = ["a folder", "file with spaces & ?.txt"];
    const encoded = encodeNodePath(segments);
    expect(encoded).not.toContain(" ");
    expect(decodeNodePath(encoded)).toEqual(segments);
  });

  it("decodes empty / undefined to []", () => {
    expect(decodeNodePath(undefined)).toEqual([]);
    expect(decodeNodePath("")).toEqual([]);
  });
});
