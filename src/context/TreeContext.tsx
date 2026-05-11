import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TreeNode } from "../types";
import { parseTreeJson } from "../lib/schema";

const STORAGE_KEY = "filetree-explorer:tree";

type TreeContextValue = {
  tree: TreeNode | null;
  loadFromJson: (raw: string) => void;
  clear: () => void;
  expanded: Set<string>;
  toggleExpanded: (pathKey: string) => void;
  expandPath: (segments: string[]) => void;
};

const TreeContext = createContext<TreeContextValue | null>(null);

function readFromStorage(): TreeNode | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseTreeJson(raw);
  } catch {
    return null;
  }
}

export function TreeProvider({ children }: { children: ReactNode }) {
  const [tree, setTree] = useState<TreeNode | null>(() => readFromStorage());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (tree) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
      } catch {
        // storage full / disabled — silently ignore
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [tree]);

  const loadFromJson = useCallback((raw: string) => {
    const parsed = parseTreeJson(raw);
    setTree(parsed);
    setExpanded(new Set([parsed.name]));
  }, []);

  const clear = useCallback(() => {
    setTree(null);
    setExpanded(new Set());
  }, []);

  const toggleExpanded = useCallback((pathKey: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey);
      else next.add(pathKey);
      return next;
    });
  }, []);

  const expandPath = useCallback((segments: string[]) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (let i = 1; i <= segments.length; i++) {
        next.add(segments.slice(0, i).join("/"));
      }
      return next;
    });
  }, []);

  const value = useMemo<TreeContextValue>(
    () => ({ tree, loadFromJson, clear, expanded, toggleExpanded, expandPath }),
    [tree, loadFromJson, clear, expanded, toggleExpanded, expandPath],
  );

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
}

export function useTreeContext(): TreeContextValue {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error("useTreeContext must be used inside TreeProvider");
  return ctx;
}
