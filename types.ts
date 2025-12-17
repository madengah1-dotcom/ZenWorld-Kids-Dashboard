
export type Domain = "Self" | "Family" | "Community" | "Nature" | "Logic" | "Language" | "Art" | "Health";

export type AgeBand = 'A' | 'B';

export type SubscriptionTier = 'free' | 'family' | 'classroom';

export interface SyllabusItem {
    month: number;
    week: number;
    domain: Domain;
    icon: string;
    bandA: string; // Title for Band A
    bandB: string; // Title for Band B
}

export interface FilterState {
    month: number | 'all';
    band: AgeBand;
}

export const DOMAIN_COLORS: Record<Domain, string> = {
    "Self": "#FFD93D", // Sunlight Yellow
    "Family": "#FF8C61", // Persimmon Coral
    "Community": "#4D9078", // Bamboo Teal
    "Nature": "#4D9078", // Bamboo Teal
    "Logic": "#6AB8EE", // Sky Blue
    "Language": "#FF8C61", // Coral
    "Art": "#6AB8EE", // Blue
    "Health": "#FFD93D"  // Yellow
};

export const TIER_CONFIG: Record<SubscriptionTier, { label: string, color: string, icon: string, price: string }> = {
    free: { label: "Little Sprout", color: "gray", icon: "🌱", price: "Free" },
    family: { label: "Bamboo Garden", color: "niko-teal", icon: "🎋", price: "$5/mo" },
    classroom: { label: "Wise Grove", color: "niko-yellow", icon: "🌳", price: "$15/mo" }
};

export const MONTH_TITLES: Record<number, string> = {
    1: "Month 1: The Self & The Routine",
    2: "Month 2: Harmony & Others",
    3: "Month 3: Resilience & Growth"
};

// Studio Types
export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
export type ImageSize = "1K" | "2K" | "4K";
export type VideoAspectRatio = "16:9" | "9:16";

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    groundingMetadata?: any;
}
