import { useState, useEffect } from 'react';
import { Card, Answers, CATEGORIES, CategoryId } from './types';

// Custom hook for debouncing values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Recommendation scoring
export function scoreCard(card: Card, a: Answers): number {
  const base = card.recommendedFor.includes(a.priority) ? 10 : 0;
  // Fee comfort (closer to preference is better). If any, small bonus to mid tiers.
  const feeOrder = ["$","$$","$$$","$$$$"] as const;
  const feeIndex = (x: string) => Math.max(0, feeOrder.indexOf(x as "$" | "$$" | "$$$" | "$$$$"));
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
export function buildShareURL(a: Answers): string {
  const url = new URL(window.location.href);
  url.searchParams.set("w", "1");
  url.searchParams.set("p", a.priority);
  url.searchParams.set("f", a.feeComfort);
  url.searchParams.set("r", a.redemption);
  return url.toString();
}

export function parseAnswersFromURL(): Answers | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const w = p.get("w");
  if (w !== "1") return null;
  
  const priority = p.get("p") as CategoryId;
  if (!CATEGORIES.find(c => c.id === priority)) return null;
  
  const feeComfort = p.get("f") as Answers["feeComfort"];
  if (!feeComfort || !["any", "$", "$$", "$$$", "$$$$"].includes(feeComfort)) return null;
  
  const redemption = p.get("r") as Answers["redemption"];
  if (!redemption || !["points", "cashback", "simple"].includes(redemption)) return null;
  
  return { priority, feeComfort, redemption };
}

// Track referral clicks (uses sendBeacon so it survives navigation)
export function trackClick(action: "apply" | "copy_link", card: Card, a: Answers): void {
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
  } catch {
    // no-op
  }
}