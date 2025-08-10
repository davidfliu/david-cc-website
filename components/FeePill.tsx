import React from "react";
import { IconShield } from "./icons";
import { Card, FeePillStyle } from "./types";

// Helper: Fee pill
export function FeePill({ fee }: { fee: Card["annualFee"] }) {
  const map: Record<Card["annualFee"], FeePillStyle> = {
    "$": { label: "$0–$95", color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    "$$": { label: "$95–$199", color: "bg-blue-50 text-blue-700 ring-blue-200" },
    "$$$": { label: "$200–$395", color: "bg-violet-50 text-violet-700 ring-violet-200" },
    "$$$$": { label: "$400+", color: "bg-rose-50 text-rose-700 ring-rose-200" },
  };
  const { label, color } = map[fee];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${color}`}>
      <IconShield className="h-3.5 w-3.5" /> {label}
    </span>
  );
}