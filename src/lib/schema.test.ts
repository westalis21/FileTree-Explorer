import { describe, expect, it } from "vitest";
import { parseTreeJson } from "./schema";

describe("parseTreeJson", () => {
  it("parses a valid single file", () => {
    const json = JSON.stringify({ name: "a.txt", type: "file", size: 10 });
    const tree = parseTreeJson(json);
    expect(tree).toEqual({ name: "a.txt", type: "file", size: 10 });
  });

  it("parses a nested folder structure", () => {
    const json = JSON.stringify({
      name: "root",
      type: "folder",
      children: [
        { name: "a.txt", type: "file", size: 5 },
        {
          name: "sub",
          type: "folder",
          children: [{ name: "b.txt", type: "file", size: 7 }],
        },
      ],
    });
    const tree = parseTreeJson(json);
    expect(tree.type).toBe("folder");
    if (tree.type === "folder") {
      expect(tree.children).toHaveLength(2);
    }
  });

  it("rejects malformed JSON", () => {
    expect(() => parseTreeJson("{not json}")).toThrow(/Invalid JSON/);
  });

  it("rejects unknown node type", () => {
    const json = JSON.stringify({ name: "x", type: "symlink", size: 0 });
    expect(() => parseTreeJson(json)).toThrow(/Schema error/);
  });

  it("rejects file with missing size", () => {
    const json = JSON.stringify({ name: "x", type: "file" });
    expect(() => parseTreeJson(json)).toThrow(/Schema error/);
  });

  it("rejects negative file size", () => {
    const json = JSON.stringify({ name: "x", type: "file", size: -1 });
    expect(() => parseTreeJson(json)).toThrow(/Schema error/);
  });

  it("rejects folder with missing children", () => {
    const json = JSON.stringify({ name: "x", type: "folder" });
    expect(() => parseTreeJson(json)).toThrow(/Schema error/);
  });

  it("rejects empty name", () => {
    const json = JSON.stringify({ name: "", type: "file", size: 1 });
    expect(() => parseTreeJson(json)).toThrow(/Schema error/);
  });
});
