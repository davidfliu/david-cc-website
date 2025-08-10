import { IconStars, IconUtensils, IconPlane, IconSparkle } from './icons';

// Categories / use cases
export const CATEGORIES = [
  { id: "one_card", label: "One‑card setup", icon: IconStars, blurb: "One card that does most things well." },
  { id: "dining_groceries", label: "Dining & Groceries", icon: IconUtensils, blurb: "Max value at restaurants & supermarkets." },
  { id: "flights_hotels", label: "Flights & Hotels", icon: IconPlane, blurb: "Earn & burn for travel, perks optional." },
  { id: "everything_else", label: "Everything Else", icon: IconSparkle, blurb: "Strong everyday earn & simple redemptions." },
] as const;

export type CategoryId = typeof CATEGORIES[number]["id"];

export type Card = {
  id: string;
  name: string;
  issuer: string;
  headline: string;
  highlights: string[];
  annualFee: "$" | "$$" | "$$$" | "$$$$";
  recommendedFor: CategoryId[];
  flavor: "points" | "cashback";
  simplicity: number; // 1=expert, 4=super simple
  referralUrl: string;
  featured?: boolean;
  _score?: number; // Added for performance optimization
};

export type Answers = {
  priority: CategoryId;        // what they value most
  feeComfort: "any" | "$" | "$$" | "$$$" | "$$$$";
  redemption: "points" | "cashback" | "simple"; // preference for how to redeem
};

export const DEFAULT_ANSWERS: Answers = {
  priority: "one_card",
  feeComfort: "any",
  redemption: "simple",
};

// Fee pill styling type
export type FeePillStyle = {
  label: string;
  color: string;
};