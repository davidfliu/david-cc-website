'use client'

import React, { useMemo, useState, useEffect } from "react";

// Minimal inline icons (no external deps)
const IconPlane = (props:any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M10.5 21l1.5-6 7-7a1.5 1.5 0 10-2.12-2.12l-7 7-6 1.5L9 13.5"/>
  </svg>
);
const IconUtensils = (props:any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M4 3v8a2 2 0 002 2h0V3M8 3v10M12 3v6a3 3 0 003 3v9M19 3v10"/>
  </svg>
);
const IconStars = (props:any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M12 3l2.6 5.26L20 9.27l-4 3.9.95 5.53L12 16.9 7.05 18.7 8 13.17l-4-3.9 5.4-1.01L12 3z"/>
  </svg>
);
const IconSparkle = (props:any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z"/>
    <path d="M4 14l.9 2.1L7 17l-2.1.9L4 20l-.9-2.1L1 17l2.1-.9L4 14zM20 12l.75 1.75L22.5 14.5l-1.75.75L20 17l-.75-1.75L17.5 14.5l1.75-.75L20 12z"/>
  </svg>
);
const IconGift = (props:any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13"/><path d="M12 8s-2.5-4-5-4-3 1.5-3 3 1 3 3 3h5"/><path d="M12 8s2.5-4 5-4 3 1.5 3 3-1 3-3 3h-5"/>
  </svg>
);
const IconLink = (props:any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M10.5 13.5a3 3 0 004.24 0l3.76-3.76a3 3 0 10-4.24-4.24l-1.06 1.06"/>
    <path d="M13.5 10.5a3 3 0 00-4.24 0L5.5 14.26a3 3 0 004.24 4.24l1.06-1.06"/>
  </svg>
);
const IconShield = (props:any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M12 3l7 4v6c0 5-3.5 7.5-7 8-3.5-.5-7-3-7-8V7l7-4z"/>
  </svg>
);

// Categories / use cases
const CATEGORIES = [
  { id: "one_card", label: "One‑card setup", icon: IconStars, blurb: "One card that does most things well." },
  { id: "dining_groceries", label: "Dining & Groceries", icon: IconUtensils, blurb: "Max value at restaurants & supermarkets." },
  { id: "flights_hotels", label: "Flights & Hotels", icon: IconPlane, blurb: "Earn & burn for travel, perks optional." },
  { id: "everything_else", label: "Everything Else", icon: IconSparkle, blurb: "Strong everyday earn & simple redemptions." },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

type Card = {
  id: string;
  name: string;
  issuer: string;
  headline: string;
  highlights: string[];
  annualFee: "$" | "$$" | "$$$" | "$$$$" | string;
  recommendedFor: CategoryId[];
  flavor: "points" | "cashback";
  simplicity: number; // 1=expert, 4=super simple
  referralUrl: string;
  featured?: boolean;
};

type Answers = {
  priority: CategoryId;        // what they value most
  feeComfort: "any" | "$" | "$$" | "$$$" | "$$$$";
  redemption: "points" | "cashback" | "simple"; // preference for how to redeem
};

const DEFAULT_ANSWERS: Answers = {
  priority: "one_card",
  feeComfort: "any",
  redemption: "simple",
};

// Helper: Fee pill
function FeePill({ fee }: { fee: Card["annualFee"] }) {
  const map:any = {
    "$": { label: "$0–$95", color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    "$$": { label: "$95–$199", color: "bg-blue-50 text-blue-700 ring-blue-200" },
    "$$$": { label: "$200–$395", color: "bg-violet-50 text-violet-700 ring-violet-200" },
    "$$$$": { label: "$400+", color: "bg-rose-50 text-rose-700 ring-rose-200" },
  };
  const { label, color } = map[fee] || map["$"];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${color}`}>
      <IconShield className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

// Track referral clicks (uses sendBeacon so it survives navigation)
function trackClick(action: "apply" | "copy_link", card: Card, a: Answers){
  try{
    const payload = {
      action,
      cardId: card.id,
      cardName: card.name,
      ts: Date.now(),
      path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      answers: a,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/click', blob);
  } catch (e) {
    // no-op
  }
}

// Card tile
function CardTile({ card, answers }: { card: Card; answers: Answers }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {card.featured && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          <IconStars className="h-3.5 w-3.5"/> Featured
        </span>
      )}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">{card.name}</h3>
          <p className="mt-1 text-sm text-zinc-500">{card.issuer}</p>
        </div>
        <FeePill fee={card.annualFee} />
      </div>
      <p className="mb-3 text-sm text-zinc-700">{card.headline}</p>
      <ul className="mb-5 grid list-disc gap-2 pl-4 text-sm text-zinc-600">
        {card.highlights.map((h:string, i:number) => (
          <li key={i} className="marker:text-zinc-400">{h}</li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <a
          href={card.referralUrl}
          target="_blank"
          rel="noreferrer"
          onClick={()=>trackClick('apply', card, answers)}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
        >
          Apply via Referral
          <IconLink className="ml-2 h-4 w-4"/>
        </a>
        <button
          onClick={() => { navigator.clipboard?.writeText(card.referralUrl); trackClick('copy_link', card, answers); }}
          className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-3.5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}

// Recommendation scoring
function scoreCard(card:Card, a:Answers) {
  const base = card.recommendedFor.includes(a.priority) ? 10 : 0;
  // Fee comfort (closer to preference is better). If any, small bonus to mid tiers.
  const feeOrder = ["$","$$","$$$","$$$$"] as const;
  const feeIndex = (x:string) => Math.max(0, feeOrder.indexOf(x as "$" | "$$" | "$$$" | "$$$$"));
  let feeScore = 0;
  if (a.feeComfort === "any") {
    const feeMap: Record<string, number> = {"$":2, "$$":3, "$$$":3, "$$$$":1};
    feeScore = feeMap[card.annualFee] || 0;
  } else {
    feeScore = 4 - Math.abs(feeIndex(card.annualFee) - feeIndex(a.feeComfort));
  }
  // Redemption preference
  const redScore = a.redemption === "simple"
    ? card.simplicity // higher is simpler
    : (card.flavor === a.redemption ? 4 : 0);
  // Light tie‑breaker for featured
  const featured = card.featured ? 1 : 0;
  return base + feeScore + redScore + featured;
}

// Share helpers
function buildShareURL(a:Answers) {
  const url = new URL(window.location.href);
  url.searchParams.set("w", "1");
  url.searchParams.set("p", a.priority);
  url.searchParams.set("f", a.feeComfort);
  url.searchParams.set("r", a.redemption);
  return url.toString();
}

function parseAnswersFromURL(): Answers | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const w = p.get("w");
  if (w !== "1") return null;
  const priority = (p.get("p") as CategoryId) || "one_card";
  const feeComfort = (p.get("f") as any) || "any";
  const redemption = (p.get("r") as any) || "simple";
  return { priority, feeComfort, redemption };
}

// Category Tabs (still useful after the wizard)
function CategoryTabs({ current, setCurrent }:{ current:CategoryId; setCurrent:(id:CategoryId)=>void }){
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CATEGORIES.map((c) => {
        const ActiveIcon:any = c.icon;
        const active = current === c.id;
        return (
          <button
            key={c.id}
            onClick={() => setCurrent(c.id)}
            className={`group rounded-2xl border p-4 text-left transition ${active?"border-zinc-900 bg-zinc-900 text-white shadow-sm":"border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"}`}
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

// Controls bar (search + fee)
function ControlsBar({ query, setQuery, feeBand, setFeeBand }:{ query:string; setQuery:(v:string)=>void; feeBand:string; setFeeBand:(v:string)=>void }){
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards (name, issuer)"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {[{k:"",label:"All fees"},{k:"$",label:"$0–$95"},{k:"$$",label:"$95–$199"},{k:"$$$",label:"$200–$395"},{k:"$$$$",label:"$400+"}].map((b:any)=> (
          <button key={b.k||"all"} onClick={()=>setFeeBand(b.k)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-zinc-300 ${feeBand===b.k?"bg-zinc-900 text-white":"border border-zinc-300 text-zinc-700 hover:bg-zinc-50"}`}>{b.label}</button>
        ))}
      </div>
    </div>
  );
}

// Wizard modal (3 quick questions)
function Wizard({ initial, onDone }:{ initial:Answers; onDone:(a:Answers)=>void }){
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(initial);

  function next(){ setStep((s)=> Math.min(3, s+1)); }
  function back(){ setStep((s)=> Math.max(1, s-1)); }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="text-sm font-semibold text-zinc-900">Quick Start • Step {step} of 3</div>
          <button className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-50" onClick={()=>onDone(answers)}>Skip</button>
        </div>
        <div className="px-5 py-5">
          {step===1 && (
            <div>
              <h3 className="text-lg font-bold">What do you value most?</h3>
              <p className="mt-1 text-sm text-zinc-600">Pick the closest match.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CATEGORIES.map((c)=>{
                  const Icon:any = c.icon; const active = answers.priority===c.id;
                  return (
                    <button key={c.id} onClick={()=>setAnswers({...answers, priority:c.id as CategoryId})} className={`rounded-2xl border p-4 text-left transition ${active?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${active?"text-white":"text-zinc-900"}`} />
                        <span className={`text-sm font-semibold ${active?"text-white":"text-zinc-900"}`}>{c.label}</span>
                      </div>
                      <p className={`mt-1 text-xs ${active?"text-zinc-200":"text-zinc-500"}`}>{c.blurb}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {step===2 && (
            <div>
              <h3 className="text-lg font-bold">How do you feel about annual fees?</h3>
              <p className="mt-1 text-sm text-zinc-600">Choose the highest fee you're comfortable paying.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[{k:"any",label:"Any"},{k:"$",label:"$0–$95"},{k:"$$",label:"$95–$199"},{k:"$$$",label:"$200–$395"},{k:"$$$$",label:"$400+"}].map((opt:any)=>{
                  const active = answers.feeComfort===opt.k;
                  return (
                    <button key={opt.k} onClick={()=>setAnswers({...answers, feeComfort: opt.k})} className={`rounded-xl border px-3 py-3 text-sm ${active?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}`}>{opt.label}</button>
                  )
                })}
              </div>
            </div>
          )}
          {step===3 && (
            <div>
              <h3 className="text-lg font-bold">How do you prefer rewards?</h3>
              <p className="mt-1 text-sm text-zinc-600">Pick what sounds easiest to you.</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[{k:"points",label:"Transferable points"},{k:"cashback",label:"Cash back"},{k:"simple",label:"Whatever's simplest"}].map((opt:any)=>{
                  const active = answers.redemption===opt.k;
                  return (
                    <button key={opt.k} onClick={()=>setAnswers({...answers, redemption: opt.k})} className={`rounded-xl border px-3 py-3 text-sm ${active?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}`}>{opt.label}</button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-5 py-4">
          <button onClick={back} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40" disabled={step===1}>Back</button>
          {step<3 ? (
            <button onClick={next} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Next</button>
          ) : (
            <button onClick={()=>onDone(answers)} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">See my picks</button>
          )}
        </div>
      </div>
    </div>
  );
}

// Share current result helper
function ShareCurrent({ a }:{ a:Answers }){
  return (
    <button
      onClick={()=>{
        const url = buildShareURL(a);
        navigator.clipboard?.writeText(url);
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
    >
      Copy shareable result
    </button>
  );
}

// Fallback catalog used only if /api/cards fails (keeps app usable during dev)
const FALLBACK_CARDS: Card[] = [
  { id:"amex-gold", name:"American Express® Gold", issuer:"American Express", headline:"Standout for dining & groceries.", highlights:["Excellent earn at restaurants","Strong U.S. supermarket rewards","Transfer partners for travel value"], annualFee:"$$$", recommendedFor:["dining_groceries"], flavor:"points", simplicity:2, referralUrl:"https://your-amex-gold-referral", featured:true },
  { id:"amex-plat", name:"American Express® Platinum", issuer:"American Express", headline:"Premium travel experience & lounges.", highlights:["Wide lounge access (varies)","Premium travel credits","Best for frequent travelers"], annualFee:"$$$$", recommendedFor:["flights_hotels"], flavor:"points", simplicity:1, referralUrl:"https://your-amex-plat-referral" },
];

export default function Page(){
  // Category tab state (still useful after wizard)
  const [category, setCategory] = useState<CategoryId>(CATEGORIES[0].id);
  const [query, setQuery] = useState("");
  const [feeBand, setFeeBand] = useState("");

  // Load answers from URL if provided
  const urlAnswers = typeof window!=="undefined" ? parseAnswersFromURL() : null;
  const [answers, setAnswers] = useState<Answers>(urlAnswers || DEFAULT_ANSWERS);
  const [showWizard, setShowWizard] = useState<boolean>(()=>{
    if (typeof window === "undefined") return false;
    if (urlAnswers) return false; // deep-linked result
    const seen = window.localStorage.getItem("dccr.seenWizard");
    return seen ? false : true;
  });

  useEffect(()=>{ if (!showWizard) window.localStorage.setItem("dccr.seenWizard","1"); },[showWizard]);
  useEffect(()=>{ setCategory(answers.priority); }, [answers.priority]);

  // Fetch cards from API (JSON-backed). Fallback to embedded defaults if it fails.
  const [cards, setCards] = useState<Card[]>([]);
  useEffect(()=>{
    let mounted = true;
    fetch('/api/cards')
      .then(r=> r.ok ? r.json() : Promise.reject(r.status))
      .then((data:Card[])=>{ if(mounted) setCards(data); })
      .catch(()=>{ if(mounted) setCards(FALLBACK_CARDS as Card[]); });
    return ()=>{ mounted = false };
  },[]);

  const ranked = useMemo(()=>{
    return cards
      .filter((c)=> c.recommendedFor.includes(answers.priority))
      .sort((a,b)=> scoreCard(b, answers) - scoreCard(a, answers));
  }, [cards, answers]);

  const filtered = useMemo(()=>{
    return ranked
      .filter((c)=> (feeBand? c.annualFee===feeBand : true))
      .filter((c)=> {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q);
      });
  }, [ranked, feeBand, query]);

  function handleWizardDone(a:Answers){
    setAnswers(a);
    setShowWizard(false);
    const url = buildShareURL(a);
    window.history.replaceState({}, "", url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
              <IconGift className="h-5 w-5"/>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">David's</p>
              <h1 className="-mt-0.5 text-lg font-extrabold tracking-tight">Credit Card Recommendations</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={()=>setShowWizard(true)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">Start wizard</button>
            <a href="#how-it-works" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">How it works</a>
          </div>
        </div>
      </header>

      {/* Hero + Snapshot */}
      <section className="border-b border-zinc-200 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 md:grid-cols-2 md:py-14">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Get the right card in 3 quick taps.</h2>
            <p className="mt-3 max-w-prose text-zinc-600">Open this on your phone, answer three questions, and you'll get David's short list with referral links.</p>
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
              <button onClick={()=>setShowWizard(true)} className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800">Start the 30‑second wizard</button>
              <ShareCurrent a={answers} />
            </div>
            <div className="mt-6">
              <CategoryTabs current={category} setCurrent={setCategory} />
            </div>
          </div>
          <div className="flex items-center">
            <div className="mx-auto w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
              <ControlsBar query={query} setQuery={setQuery} feeBand={feeBand} setFeeBand={setFeeBand} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {filtered.slice(0,4).map((card)=> <CardTile key={card.id} card={card} answers={answers} />)}
                {filtered.length===0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">No cards match your filters. Clear search or adjust fee band.</div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <a href="#full-list" className="text-sm font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900">See full list ↓</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full list */}
      <section id="full-list" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Top picks for: {CATEGORIES.find((c)=>c.id===category)?.label}</h3>
            <p className="mt-1 text-sm text-zinc-600">Curated by David. Offers change—always check the issuer's current terms before applying.</p>
          </div>
          <ShareCurrent a={answers} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card)=> <CardTile key={card.id} card={card} answers={answers} />)}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h3 className="text-xl font-bold">How this page works</h3>
          <ol className="mt-3 grid gap-3 text-sm text-zinc-700 sm:grid-cols-2 lg:grid-cols-4">
            <li className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="font-semibold">1) Answer 3 questions</p><p className="mt-1 text-zinc-600">Wizard picks a category, fee comfort, and redemption style.</p></li>
            <li className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="font-semibold">2) Get ranked cards</p><p className="mt-1 text-zinc-600">A small heuristic sorts my go‑to recommendations.</p></li>
            <li className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="font-semibold">3) Share or save</p><p className="mt-1 text-zinc-600">Copy a link to the exact result and send it to friends.</p></li>
            <li className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="font-semibold">4) Apply via referral</p><p className="mt-1 text-zinc-600">Each card opens your referral link in a new tab.</p></li>
          </ol>
          <p className="mt-6 text-xs text-zinc-500">Disclaimer: Not financial advice. Card benefits and welcome offers change often. Review the issuer's official terms before applying.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-600 md:flex-row">
          <p>© {new Date().getFullYear()} David. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowWizard(true)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">Run wizard again</button>
          </div>
        </div>
      </footer>

      {showWizard && <Wizard initial={answers} onDone={handleWizardDone} />}
    </div>
  );
}