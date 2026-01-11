"use client";

import * as React from "react";
import Link from "next/link";
import { useTransition } from "react";
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
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    return window.confirm(`Eliminare "${title}"?`);
  }

  return (
    <div className="mt-4">
      {/* MOBILE: griglia 2 colonne (mai overflow). DESKTOP: riga */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => moveDishInCategory(dishId, "up"))}
          className="h-[42px] rounded-xl px-3 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5 disabled:opacity-60"
        >
          ↑ Su
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => moveDishInCategory(dishId, "down"))}
          className="h-[42px] rounded-xl px-3 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5 disabled:opacity-60"
        >
          ↓ Giù
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => quickToggleAvailability(dishId, !isAvailable))
          }
          className={[
            "h-[42px] rounded-xl px-3 text-sm font-semibold ring-1 disabled:opacity-60",
            isAvailable
              ? "bg-emerald-50 ring-emerald-200 text-emerald-700 hover:bg-emerald-100"
              : "bg-red-50 ring-red-200 text-red-700 hover:bg-red-100",
          ].join(" ")}
        >
          {isAvailable ? "Nascondi" : "Mostra"}
        </button>

        <Link
          href={`/admin/dishes/${dishId}`}
          className="h-[42px] inline-flex items-center justify-center rounded-xl px-3 text-sm font-semibold ring-1 ring-black/10 bg-white hover:bg-black/5"
        >
          Modifica
        </Link>

        {/* Elimina: su mobile occupa tutta la riga sotto */}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirmDelete()) return;
            startTransition(async () => deleteDishAction(dishId));
          }}
          className="h-[42px] col-span-2 sm:col-span-1 rounded-xl px-3 text-sm font-semibold ring-1 ring-red-200 text-red-700 bg-white hover:bg-red-50 disabled:opacity-60"
        >
          Elimina
        </button>
      </div>
    </div>
  );
}
