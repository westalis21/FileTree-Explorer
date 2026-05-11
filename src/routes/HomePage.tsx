import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTreeContext } from "../context/TreeContext";

const SAMPLE_JSON = `{
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
}`;

export default function HomePage() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { loadFromJson, tree } = useTreeContext();
  const navigate = useNavigate();

  const submit = (raw: string) => {
    try {
      loadFromJson(raw);
      setError(null);
      navigate("/tree");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const raw = await file.text();
    setText(raw);
    submit(raw);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Load a directory tree
      </h1>
      <p className="mb-6 text-sm text-slate-600">
        Paste a JSON document below, or upload a <code>.json</code> file. The
        tree will be validated and stored locally so you can navigate it across
        refreshes.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label
          htmlFor="json-input"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          JSON
        </label>
        <textarea
          id="json-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          spellCheck={false}
          placeholder="Paste tree JSON here..."
          className="w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-5 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        {error && (
          <div
            role="alert"
            className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => submit(text)}
            disabled={!text.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Visualise
          </button>

          <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Upload .json
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFile}
            />
          </label>

          <button
            type="button"
            onClick={() => setText(SAMPLE_JSON)}
            className="text-sm text-indigo-600 hover:underline"
          >
            Insert sample
          </button>

          {tree && (
            <button
              type="button"
              onClick={() => navigate("/tree")}
              className="ml-auto text-sm text-slate-600 hover:underline"
            >
              Continue with current tree →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
