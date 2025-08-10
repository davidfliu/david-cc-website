'use client'

import React, { useMemo, useState, useEffect } from "react";
import {
  IconGift,
  CATEGORIES,
  Card,
  Answers,
  DEFAULT_ANSWERS,
  CategoryId,
  useDebounce,
  scoreCard,
  buildShareURL,
  parseAnswersFromURL,
  CardTile,
  CategoryTabs,
  ControlsBar,
  Wizard,
  ShareCurrent,
  ErrorBoundary,
  CardGridSkeleton,
  LoadingState,
  ToastProvider,
  useToast
} from "../components";

// Fallback catalog used only if /api/cards fails (keeps app usable during dev)
const FALLBACK_CARDS: Card[] = [
  { id:"amex-gold", name:"American Express® Gold", issuer:"American Express", headline:"Standout for dining & groceries.", highlights:["Excellent earn at restaurants","Strong U.S. supermarket rewards","Transfer partners for travel value"], annualFee:"$$$", recommendedFor:["dining_groceries"], flavor:"points", simplicity:2, referralUrl:"https://your-amex-gold-referral", featured:true },
  { id:"amex-plat", name:"American Express® Platinum", issuer:"American Express", headline:"Premium travel experience & lounges.", highlights:["Wide lounge access (varies)","Premium travel credits","Best for frequent travelers"], annualFee:"$$$$", recommendedFor:["flights_hotels"], flavor:"points", simplicity:1, referralUrl:"https://your-amex-plat-referral" },
];

function PageContent() {
  // Category tab state (still useful after wizard)
  const [category, setCategory] = useState<CategoryId>(CATEGORIES[0].id);
  const [query, setQuery] = useState("");
  const [feeBand, setFeeBand] = useState("");
  
  // Debounced search query for better performance
  const debouncedQuery = useDebounce(query, 300);

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
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    setError(null);
    
    fetch('/api/cards')
      .then(r=> {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then((data:Card[])=>{ 
        if(mounted) {
          setCards(data); 
          setLoading(false);
        }
      })
      .catch((err)=>{ 
        if(mounted) {
          console.warn('Failed to fetch cards from API, using fallback:', err);
          setCards(FALLBACK_CARDS as Card[]); 
          setError('Using cached card data. Some cards may be outdated.');
          setLoading(false);
          showToast('Using cached card data', 'warning');
        }
      });
    return ()=>{ mounted = false };
  },[showToast]);

  // Pre-compute scores for all cards to avoid recalculation
  const scoredCards = useMemo(()=>{
    return cards.map(card => ({
      ...card,
      _score: scoreCard(card, answers)
    }));
  }, [cards, answers]);

  // Memoized ranked cards based on current category
  const ranked = useMemo(()=>{
    return scoredCards
      .filter((c)=> c.recommendedFor.includes(answers.priority))
      .sort((a,b)=> b._score - a._score);
  }, [scoredCards, answers.priority]);

  // Optimized filtering with debounced query
  const filtered = useMemo(()=>{
    let result = ranked;

    // Fee filter
    if (feeBand) {
      result = result.filter((c)=> c.annualFee === feeBand);
    }

    // Search filter (debounced)
    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((c)=> 
        c.name.toLowerCase().includes(q) || 
        c.issuer.toLowerCase().includes(q)
      );
    }

    return result;
  }, [ranked, feeBand, debouncedQuery]);

  // Memoized share URL to avoid recreating on every render
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return buildShareURL(answers);
  }, [answers]);

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
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">David&apos;s</p>
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
            <p className="mt-3 max-w-prose text-zinc-600">Open this on your phone, answer three questions, and you&apos;ll get David&apos;s short list with referral links.</p>
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
              <button onClick={()=>setShowWizard(true)} className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800">Start the 30‑second wizard</button>
              <ShareCurrent url={shareUrl} />
            </div>
            <div className="mt-6">
              <CategoryTabs current={category} setCurrent={setCategory} />
            </div>
          </div>
          <div className="flex items-center">
            <div className="mx-auto w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
              <ControlsBar query={query} setQuery={setQuery} feeBand={feeBand} setFeeBand={setFeeBand} />
              <div className="mt-4">
                {loading ? (
                  <CardGridSkeleton count={4} />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filtered.slice(0,4).map((card)=> (
                      <ErrorBoundary key={card.id}>
                        <CardTile card={card} answers={answers} />
                      </ErrorBoundary>
                    ))}
                    {!loading && filtered.length===0 && (
                      <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">No cards match your filters. Clear search or adjust fee band.</div>
                    )}
                  </div>
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
          <ShareCurrent url={shareUrl} />
        </div>
        {loading ? (
          <LoadingState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((card)=> (
              <ErrorBoundary key={card.id}>
                <CardTile card={card} answers={answers} />
              </ErrorBoundary>
            ))}
          </div>
        )}
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

export default function Page() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <PageContent />
      </ErrorBoundary>
    </ToastProvider>
  );
}