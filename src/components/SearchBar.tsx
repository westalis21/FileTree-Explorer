import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DEBOUNCE_MS = 200;

export default function SearchBar() {
  const [params, setParams] = useSearchParams();
  const queryParam = params.get("q") ?? "";
  const [value, setValue] = useState(queryParam);

  useEffect(() => {
    setValue(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = params.get("q") ?? "";
      if (value === current) return;
      const next = new URLSearchParams(params);
      if (value.trim()) next.set("q", value);
      else next.delete("q");
      setParams(next, { replace: true });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [value, params, setParams]);

  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name…"
        aria-label="Search the tree"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        🔍
      </span>
    </div>
  );
}
