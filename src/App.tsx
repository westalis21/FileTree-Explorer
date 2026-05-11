import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./routes/HomePage";
import TreePage from "./routes/TreePage";
import { useTreeContext } from "./context/TreeContext";

function Header() {
  const { tree, clear } = useTreeContext();
  const location = useLocation();
  const onHome = location.pathname === "/";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          <span className="text-indigo-600">FileTree</span> Explorer
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {tree && !onHome && (
            <Link
              to="/tree"
              className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100"
            >
              Tree
            </Link>
          )}
          {tree && (
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function RequireTree({ children }: { children: JSX.Element }) {
  const { tree } = useTreeContext();
  if (!tree) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/tree"
            element={
              <RequireTree>
                <TreePage />
              </RequireTree>
            }
          />
          <Route
            path="/tree/*"
            element={
              <RequireTree>
                <TreePage />
              </RequireTree>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
