import React from "react";

// Controls bar (search + fee)
export function ControlsBar({ 
  query, 
  setQuery, 
  feeBand, 
  setFeeBand 
}: { 
  query: string; 
  setQuery: (v: string) => void; 
  feeBand: string; 
  setFeeBand: (v: string) => void 
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards (name, issuer)"
            aria-label="Search credit cards by name or issuer"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {([{k:"",label:"All fees"},{k:"$",label:"$0–$95"},{k:"$$",label:"$95–$199"},{k:"$$$",label:"$200–$395"},{k:"$$$$",label:"$400+"}] as const).map((b)=> (
          <button 
            key={b.k||"all"} 
            onClick={()=>setFeeBand(b.k)} 
            aria-pressed={feeBand===b.k} 
            aria-label={`Filter by ${b.label} annual fee range`} 
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 ${feeBand===b.k?"bg-zinc-900 text-white":"border border-zinc-300 text-zinc-700 hover:bg-zinc-50"}`}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}