"use client";

import * as React from "react";
import Link from "next/link";
import { deleteDishAction, moveDishInCategory, quickToggleAvailability } from "../_actions";

export default function DishRowActions({
  dishId,
  isAvailable,
  title,
}: {
  dishId: string;
  isAvailable: boolean;
  title: string;
}) {
  const [pending, startTransition] = React.useTransition();

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Errore");
      }
    });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => moveDishInCategory(dishId, "up"))}
        className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5 disabled:opacity-50"
      >
        ↑ Su
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => moveDishInCategory(dishId, "down"))}
        className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5 disabled:opacity-50"
      >
        ↓ Giù
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => quickToggleAvailability(dishId, !isAvailable))}
        className={[
          "rounded-xl px-3 py-2 text-sm font-semibold ring-1 disabled:opacity-50",
          isAvailable
            ? "bg-emerald-50 ring-emerald-200 text-emerald-700 hover:bg-emerald-100"
            : "bg-red-50 ring-red-200 text-red-700 hover:bg-red-100",
        ].join(" ")}
      >
        {isAvailable ? "Nascondi" : "Mostra"}
      </button>

      <Link
        href={`/admin/dishes/${dishId}`}
        className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5"
      >
        Modifica
      </Link>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Eliminare "${title}"?`)) return;
          run(() => deleteDishAction(dishId));
        }}
        className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-red-200 text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
      >
        Elimina
      </button>

      {pending ? (
        <span className="ml-2 inline-flex items-center text-xs font-semibold text-black/50">
          Aggiornamento…
        </span>
      ) : null}
    </div>
  );
}
