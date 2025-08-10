import React from "react";
import { CATEGORIES, CategoryId } from "./types";

// Category Tabs (still useful after the wizard)
export function CategoryTabs({ current, setCurrent }: { current: CategoryId; setCurrent: (id: CategoryId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CATEGORIES.map((c) => {
        const ActiveIcon = c.icon;
        const active = current === c.id;
        return (
          <button
            key={c.id}
            onClick={() => setCurrent(c.id)}
            aria-pressed={active}
            aria-label={`Select ${c.label} category: ${c.blurb}`}
            className={`group rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 ${active?"border-zinc-900 bg-zinc-900 text-white shadow-sm":"border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"}`}
          >
            <div className="flex items-center gap-2">
              <ActiveIcon className={`h-5 w-5 ${active?"text-white":"text-zinc-900"}`} />
              <span className={`text-sm font-semibold ${active?"text-white":"text-zinc-900"}`}>{c.label}</span>
            </div>
            <p className={`mt-1 text-xs ${active?"text-zinc-200":"text-zinc-500"}`}>{c.blurb}</p>
          </button>
        );
      })}
    </div>
  );
}