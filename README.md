# FileTree Explorer

Internal developer tool that visualizes and lets you navigate a directory tree
described as JSON. Paste or upload a JSON document and explore the structure
with expand/collapse, per-node details, breadcrumbs, and refresh-resistant
search.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed URL (typically <http://localhost:5173>).

Other scripts:

```bash
npm run build   # type-check (tsc -b) + production bundle (vite build)
npm run preview # serve the production build locally
npm test        # vitest run (unit + smoke tests)
npm run lint    # tsc --noEmit
```

Requires Node.js 18+ (developed and verified on Node 20+).

## Input format

```json
{
  "name": "root",
  "type": "folder",
  "children": [
    {
      "name": "src",
      "type": "folder",
      "children": [
        { "name": "index.ts", "type": "file", "size": 1024 },
        {
          "name": "components",
          "type": "folder",
          "children": [
            { "name": "Button.tsx", "type": "file", "size": 512 }
          ]
        }
      ]
    },
    { "name": "package.json", "type": "file", "size": 300 }
  ]
}
```

The tree can be nested arbitrarily deep. The home page has an "Insert sample"
button that drops in a working example.

## Routes

| Path | Purpose |
|---|---|
| `/` | Paste or upload JSON; validates and stores it locally |
| `/tree` | Tree view (expand/collapse) + search |
| `/tree/:nodePath` | Same view focused on a specific node; `nodePath` is a `/`-joined sequence of URL-encoded names, e.g. `src/components/Button.tsx` |

Unknown routes redirect to `/`. Visiting any `/tree*` route without a loaded
tree also redirects to `/`.

## Architecture decisions

- **Vite + React 18 + TypeScript (strict)** — fast HMR, modern toolchain. The
  app is built with `tsc -b && vite build`, so types are checked on every
  build. `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess` are all on.
- **React Router v6 with a splat route (`/tree/*`)** — node paths can contain
  any character, including segments separated by `/`. A splat lets us read the
  raw remainder via `params['*']`, then `decodeURIComponent` each segment.
  Encoding is done in `encodeNodePath` so links round-trip safely.
- **Tailwind CSS** — quickest path to a clean, consistent UI without bringing
  in a component library. The styling stays close to the markup, which keeps
  components self-contained.
- **Zod schema** — the input is user-controlled, so validation has to be
  strict. A discriminated union between `file` and `folder` plus a `z.lazy`
  recursive schema gives a clear single-source-of-truth for the shape and
  produces helpful error messages (`Schema error at <path>: <reason>`) when a
  document is malformed.
- **Context + `localStorage`** — only one piece of global state matters (the
  parsed tree). A small `TreeContext` exposes `loadFromJson`, `clear`,
  expansion state, and `expandPath`. The tree is persisted to `localStorage`,
  so a refresh keeps you in place; navigating to `/tree` after a refresh works
  without re-uploading. Zustand or Redux would be overkill here.
- **Search persisted via URL** — the search query lives in `?q=`, debounced
  200ms, replacing history entries so the back button isn't spammed. This
  fulfils the "search results survive a refresh" requirement essentially for
  free.
- **Expansion state is in-memory only.** Persisting expansion would grow
  `localStorage` and rarely matter in practice. When you navigate to a node,
  the route effect calls `expandPath` to open every ancestor automatically, so
  refreshing a deep URL still shows the correct context.
- **Single layout for `/tree` and `/tree/*`** — `TreePage` renders the tree
  sidebar on the left and the details panel on the right. When no node is
  selected, the right panel shows the root. This keeps the component count
  low and the navigation flow obvious.
- **Memoization where it earns its keep** — `findNodeByPath`, `searchTree`,
  and `calculateTotalSize` are wrapped in `useMemo` keyed on the inputs.
  Tree rendering is intentionally simple (recursive component) rather than
  virtualized; see the limitations section.

## Folder layout

```
src/
  routes/
    HomePage.tsx          # /
    TreePage.tsx          # /tree, /tree/*
  components/
    TreeView.tsx          # entry point of the recursive tree
    TreeNode.tsx          # one row + recursion
    SearchBar.tsx         # debounced ?q= search input
    SearchResults.tsx     # full-path result list
    Breadcrumbs.tsx
    FileDetails.tsx
    FolderDetails.tsx
  context/
    TreeContext.tsx       # state + localStorage sync
  lib/
    schema.ts             # Zod schema + parseTreeJson
    treeUtils.ts          # findNodeByPath, searchTree, calculateTotalSize, path codec
    format.ts             # formatBytes (B/KB/MB/GB)
  types.ts                # TreeNode, FileNode, FolderNode, SearchHit
  App.tsx, main.tsx, index.css
```

## Tests

`npm test` runs the Vitest suite (jsdom + React Testing Library):

- `lib/schema.test.ts` — valid trees, malformed JSON, type/shape errors.
- `lib/treeUtils.test.ts` — `findNodeByPath`, `calculateTotalSize`,
  `searchTree`, path encode/decode round-trip.
- `lib/format.test.ts` — `formatBytes` at B/KB/MB/GB boundaries.
- `routes/HomePage.test.tsx` — render, invalid-JSON error path, valid-JSON
  redirect to `/tree`.

## What I'd add with more time

- **Virtualised tree rendering** (e.g. `react-virtuoso` / `react-window`) for
  trees with tens of thousands of nodes. The current recursive render is fine
  for typical project trees but will degrade on huge inputs.
- **Search refinement**: match highlighting in result rows, keyboard
  navigation (↑/↓ + Enter), and result grouping by directory.
- **Drag-and-drop file upload** on the home page and copy/share buttons on the
  details panel for the full path.
- **End-to-end tests with Playwright** covering the home → tree → details
  flow and refresh behaviour.
- **Accessibility audit**: full keyboard reachability for the tree (currently
  it relies on Tab/Enter on the links and buttons; a proper `role="tree"`
  with `aria-expanded` and arrow-key navigation would be the next step).
- **Per-folder size pre-computation** memoised on the whole tree, so the
  details panel does not recompute on every render of a different folder.
- **Dark mode** via `prefers-color-scheme`.
- **Error boundary** with a "Reset stored tree" action when something
  catastrophic happens to the cached document.

## Known limitations

- The tree is rendered with one DOM node per file/folder. Performance becomes
  noticeable above ~10k visible nodes; collapse folders to mitigate.
- `localStorage` has a ~5MB quota in most browsers. Very large JSON inputs
  may fail to persist; the app still runs in-memory in that case (errors are
  swallowed). A future improvement would be to use IndexedDB.
- Duplicate sibling names are not specifically rejected by the schema —
  navigation would land on the first match. The sample TZ does not forbid
  duplicates, so this is left as-is.
- Search is case-insensitive substring match on names only. There is no
  fuzzy ranking, content search, or path search.
- The "expanded folders" state is not persisted; navigating to a deep node
  via URL re-opens its ancestors but other branches reset to collapsed on
  refresh. This is a deliberate trade-off to keep `localStorage` small.
