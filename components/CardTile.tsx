import React from "react";
import { IconStars, IconLink } from "./icons";
import { FeePill } from "./FeePill";
import { Card, Answers } from "./types";
import { trackClick, validateReferralUrl } from "./utils";
import { useToast } from "./Toast";

// Card tile
export function CardTile({ card, answers }: { card: Card; answers: Answers }) {
  const { showToast } = useToast();
  
  // Security: Validate referral URL to prevent open redirect attacks
  const isValidReferralUrl = validateReferralUrl(card.referralUrl);
  const safeReferralUrl = isValidReferralUrl ? card.referralUrl : '#';
  
  const handleCopyLink = async () => {
    if (!isValidReferralUrl) {
      showToast('Invalid referral link. Please contact support.', 'error');
      return;
    }
    
    try {
      await navigator.clipboard?.writeText(card.referralUrl);
      trackClick('copy_link', card, answers);
      showToast(`${card.name} referral link copied!`, 'success');
    } catch {
      showToast('Failed to copy link. Please try again.', 'error');
    }
  };
  
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {card.featured && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          <IconStars className="h-3.5 w-3.5" aria-hidden="true" /> Featured
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
        {card.highlights.map((h, i) => (
          <li key={i} className="marker:text-zinc-400">{h}</li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <a
          href={safeReferralUrl}
          target={isValidReferralUrl ? "_blank" : undefined}
          rel={isValidReferralUrl ? "noreferrer" : undefined}
          onClick={(e) => {
            if (!isValidReferralUrl) {
              e.preventDefault();
              showToast('Invalid referral link. Please contact support.', 'error');
              return;
            }
            trackClick('apply', card, answers);
          }}
          aria-label={`Apply for ${card.name} via referral link`}
          className={`inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isValidReferralUrl 
              ? 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-400' 
              : 'bg-zinc-400 text-zinc-600 cursor-not-allowed focus:ring-zinc-300'
          }`}
        >
          Apply via Referral
          <IconLink className="ml-2 h-4 w-4" aria-hidden="true"/>
        </a>
        <button
          onClick={handleCopyLink}
          disabled={!isValidReferralUrl}
          aria-label={`Copy referral link for ${card.name}`}
          className={`inline-flex items-center justify-center rounded-xl border px-3.5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isValidReferralUrl
              ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-300'
              : 'border-zinc-200 text-zinc-400 cursor-not-allowed focus:ring-zinc-200'
          }`}
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}