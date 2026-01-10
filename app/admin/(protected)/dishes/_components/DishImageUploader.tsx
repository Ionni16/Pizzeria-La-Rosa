"use client";

import * as React from "react";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Upload error";
}

function sanitizeUrl(input: string | null | undefined) {
  const s = String(input ?? "").trim();
  if (!s) return "";
  // blocca URL “spazzatura” tipo .../NULL o .../undefined
  if (/\/NULL(\?.*)?$/i.test(s)) return "";
  if (/\/undefined(\?.*)?$/i.test(s)) return "";
  if (/\/null(\?.*)?$/i.test(s)) return "";
  return s;
}

export default function DishImageUploader({
  initialUrl,
  inputName = "image_url",
}: {
  initialUrl: string | null;
  inputName?: string;
}) {
  const [url, setUrl] = React.useState<string>(() => sanitizeUrl(initialUrl));
  const [busy, setBusy] = React.useState(false);
  const [showUrlField, setShowUrlField] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [broken, setBroken] = React.useState(false);

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const hasImage = Boolean(url) && !broken;

  React.useEffect(() => {
    // se cambia initialUrl (edit page), risaniamo e resettiamo stato
    setUrl(sanitizeUrl(initialUrl));
    setBroken(false);
  }, [initialUrl]);

  async function uploadFile(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/upload-dish-image", {
        method: "POST",
        body: fd,
      });

      const json: unknown = await res.json();

      if (!res.ok) {
        const msg =
          typeof json === "object" && json && "error" in json
            ? String((json as { error?: unknown }).error ?? "Upload failed")
            : "Upload failed";
        throw new Error(msg);
      }

      const nextUrl =
        typeof json === "object" && json && "url" in json
          ? String((json as { url?: unknown }).url ?? "")
          : "";

      const clean = sanitizeUrl(nextUrl);
      if (!clean) throw new Error("Upload failed: url non valida");

      setUrl(clean);
      setBroken(false);
      setShowUrlField(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    await uploadFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void uploadFile(f);
  }

  function remove() {
    setUrl("");
    setBroken(false);
    setShowUrlField(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="grid gap-3">
      {/* hidden input: salva in dishes.image_url */}
      <input type="hidden" name={inputName} value={broken ? "" : url} readOnly />

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickFile}
            disabled={busy}
          />
          {busy ? "Caricamento…" : "Carica"}
        </label>

        <button
          type="button"
          onClick={() => setShowUrlField((v) => !v)}
          className="rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5"
        >
          {showUrlField ? "Chiudi link" : "Incolla link"}
        </button>

        {url ? (
          <button
            type="button"
            onClick={remove}
            className="rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-red-200 text-red-700 hover:bg-red-50"
          >
            Rimuovi
          </button>
        ) : (
          <span className="text-xs text-black/45">(opzionale)</span>
        )}
      </div>

      {showUrlField ? (
        <label className="block">
          <span className="text-xs font-medium text-black/70">URL immagine</span>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(sanitizeUrl(e.target.value));
              setBroken(false);
            }}
            placeholder="https://..."
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
          />
        </label>
      ) : null}

      {/* preview SOLO se valida; se rotta → messaggio pulito */}
      {url ? (
        broken ? (
          <div className="rounded-2xl ring-1 ring-black/10 bg-[rgb(252,250,246)] p-4 text-sm text-black/60">
            Immagine non disponibile (URL non valido).{" "}
            <button type="button" onClick={remove} className="font-semibold text-red-700 hover:underline">
              Rimuovi
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl ring-1 ring-black/10 bg-[rgb(252,250,246)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Preview"
              className="h-56 w-full object-cover"
              onError={() => setBroken(true)}
            />
          </div>
        )
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={[
            "rounded-2xl border border-dashed p-4 text-sm",
            dragOver ? "border-black/30 bg-black/5" : "border-black/15 bg-[rgb(252,250,246)]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-black/55">
              Trascina una foto qui oppure usa <span className="font-semibold text-black/70">Carica</span>.
            </div>
            <div className="text-xs text-black/40">JPG/PNG/WEBP</div>
          </div>
        </div>
      )}
    </div>
  );
}
