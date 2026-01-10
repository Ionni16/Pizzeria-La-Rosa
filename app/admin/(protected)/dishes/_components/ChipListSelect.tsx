"use client";

import * as React from "react";

type Item = {
  id: string;
  label_it: string | null;
  label_en: string | null;
  code?: string | null;
};

function labelOf(i: Item) {
  const it = (i.label_it ?? "").trim();
  const en = (i.label_en ?? "").trim();
  return it || en || "—";
}

export default function ChipListSelect({
  title,
  hint,
  name,
  items,
  defaultSelectedIds,
  showCode = false,
  maxHeightClass = "max-h-64",
}: {
  title: string;
  hint: string;
  name: "tag_ids" | "allergen_ids";
  items: Item[];
  defaultSelectedIds: string[];
  showCode?: boolean;
  maxHeightClass?: string;
}) {
  const [selected, setSelected] = React.useState<string[]>(defaultSelectedIds);

  React.useEffect(() => {
    // se cambia pagina (edit diverso), riallinea selezioni
    setSelected(defaultSelectedIds);
  }, [defaultSelectedIds]);

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function clearAll() {
    setSelected([]);
  }

  return (
    <div className="rounded-2xl ring-1 ring-black/5 bg-[rgb(252,250,246)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <p className="mt-1 text-xs text-black/50">{hint}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-black/45 tabular-nums">{selected.length}</div>
          {selected.length ? (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5"
            >
              Svuota
            </button>
          ) : null}
        </div>
      </div>

      {/* hidden inputs: FormData.getAll(name) */}
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      {/* chips selezionate */}
      {selected.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((id) => {
            const item = items.find((x) => x.id === id);
            const text = item ? labelOf(item) : "—";
            const code = showCode && item?.code ? `${item.code} · ` : "";
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10 hover:bg-black/5"
                title="Tocca per rimuovere"
              >
                <span className="text-black/60">{code}</span>
                {text}
                <span className="text-black/40">×</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 text-xs text-black/45">Nessuna selezione.</div>
      )}

      {/* lista completa */}
      <div className={`mt-4 ${maxHeightClass} overflow-auto pr-1 space-y-2`}>
        {items.map((i) => {
          const checked = selectedSet.has(i.id);
          const code = showCode && i.code ? `${i.code} · ` : "";
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => toggle(i.id)}
              className={[
                "w-full text-left rounded-xl px-3 py-2 ring-1 transition",
                checked ? "bg-white ring-emerald-200" : "bg-white/70 ring-black/10 hover:bg-white",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-black/75">
                  <span className="text-black/55">{code}</span>
                  {labelOf(i)}
                </div>
                <div className={checked ? "text-emerald-700 text-xs font-semibold" : "text-black/35 text-xs"}>
                  {checked ? "✓" : ""}
                </div>
              </div>

              {(i.label_en ?? "").trim() ? (
                <div className="mt-0.5 text-xs text-black/45">{i.label_en}</div>
              ) : null}
            </button>
          );
        })}

        {items.length === 0 ? <div className="text-sm text-black/55">Lista vuota.</div> : null}
      </div>
    </div>
  );
}
