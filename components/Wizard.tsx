import React, { useState, useEffect, useCallback } from "react";
import { CATEGORIES, Answers, CategoryId } from "./types";

// Wizard modal (3 quick questions)
export function Wizard({ initial, onDone }: { initial: Answers; onDone: (a: Answers) => void }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(initial);

  function next() { setStep((s) => Math.min(3, s + 1)); }
  function back() { setStep((s) => Math.max(1, s - 1)); }

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onDone(answers);
    }
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault();
      next();
    }
  }, [step, answers, onDone]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management
  useEffect(() => {
    const focusableElements = document.querySelectorAll('[tabindex]:not([tabindex="-1"]), button:not([disabled]), input, select, textarea, a[href]');
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement)?.focus();
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div id="wizard-title" className="text-sm font-semibold text-zinc-900">Quick Start • Step {step} of 3</div>
          <button 
            className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2" 
            onClick={() => onDone(answers)} 
            aria-label="Skip wizard"
          >
            Skip
          </button>
        </div>
        <div className="px-5 py-5">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold">What do you value most?</h3>
              <p className="mt-1 text-sm text-zinc-600">Pick the closest match.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon; 
                  const active = answers.priority === c.id;
                  return (
                    <button 
                      key={c.id} 
                      onClick={() => setAnswers({...answers, priority: c.id as CategoryId})} 
                      aria-pressed={active} 
                      aria-label={`Select ${c.label}: ${c.blurb}`} 
                      className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 ${active?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${active?"text-white":"text-zinc-900"}`} aria-hidden="true" />
                        <span className={`text-sm font-semibold ${active?"text-white":"text-zinc-900"}`}>{c.label}</span>
                      </div>
                      <p className={`mt-1 text-xs ${active?"text-zinc-200":"text-zinc-500"}`}>{c.blurb}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold">How do you feel about annual fees?</h3>
              <p className="mt-1 text-sm text-zinc-600">Choose the highest fee you're comfortable paying.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {([{k:"any",label:"Any"},{k:"$",label:"$0–$95"},{k:"$$",label:"$95–$199"},{k:"$$$",label:"$200–$395"},{k:"$$$$",label:"$400+"}] as const).map((opt) => {
                  const active = answers.feeComfort === opt.k;
                  return (
                    <button 
                      key={opt.k} 
                      onClick={() => setAnswers({...answers, feeComfort: opt.k})} 
                      aria-pressed={active} 
                      aria-label={`Select ${opt.label} fee comfort level`} 
                      className={`rounded-xl border px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 ${active?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold">How do you prefer rewards?</h3>
              <p className="mt-1 text-sm text-zinc-600">Pick what sounds easiest to you.</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {([{k:"points",label:"Transferable points"},{k:"cashback",label:"Cash back"},{k:"simple",label:"Whatever's simplest"}] as const).map((opt) => {
                  const active = answers.redemption === opt.k;
                  return (
                    <button 
                      key={opt.k} 
                      onClick={() => setAnswers({...answers, redemption: opt.k})} 
                      aria-pressed={active} 
                      aria-label={`Select ${opt.label} redemption preference`} 
                      className={`rounded-xl border px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 ${active?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-5 py-4">
          <button 
            onClick={back} 
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2" 
            disabled={step === 1} 
            aria-label="Go to previous step"
          >
            Back
          </button>
          {step < 3 ? (
            <button 
              onClick={next} 
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2" 
              aria-label="Go to next step"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={() => onDone(answers)} 
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2" 
              aria-label="Complete wizard and see recommendations"
            >
              See my picks
            </button>
          )}
        </div>
      </div>
    </div>
  );
}