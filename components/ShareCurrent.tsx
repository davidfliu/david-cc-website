import React from "react";
import { useToast } from "./Toast";

// Share current result helper
export function ShareCurrent({ url }: { url: string }) {
  const { showToast } = useToast();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy link. Please try again.', 'error');
    }
  };
  
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
    >
      Copy shareable result
    </button>
  );
}