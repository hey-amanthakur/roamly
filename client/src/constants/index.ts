export interface CategoryOption {
  key: string;
  label: string;
  icon: string;
  desc: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface PresetLocation {
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface ReportReason {
  value: string;
  label: string;
}

export const CATEGORIES: CategoryOption[] = [
  { key: "travel", label: "Travel", icon: "🌍", desc: "Discover hidden gems and breathtaking destinations" },
  { key: "food", label: "Food", icon: "🍜", desc: "Culinary adventures from street food to fine dining" },
  { key: "code", label: "Code", icon: "💻", desc: "Building the future, one commit at a time" },
];

export const SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
  { value: "most_discussed", label: "Most Discussed" },
];

export const DEFAULT_AVATAR = "default-avatar.png";

export const PAGE_LIMITS = {
  DEFAULT: 10,
  PROFILE: 5,
  DRAFTS: 10,
  DASHBOARD: 10,
} as const;

export const MAX_UPLOAD_FILES = 5;
export const PASSWORD_MIN_LENGTH = 6;
export const BIO_MAX_LENGTH = 200;

export const SOCIAL_LINKS = {
  github: "https://github.com/amanthakur",
  twitter: "https://twitter.com/amanthakur",
  linkedin: "https://linkedin.com/in/amanthakur",
  instagram: "https://instagram.com/amanthakur",
  avatar: "https://avatars.githubusercontent.com/u/54764701?s=400&u=df5e2186288f8de8b92b5e7781c2e4389a65d7e3&v=4",
} as const;

export const AUTHOR = {
  name: "Aman Thakur",
  bio: "Full-stack developer & travel enthusiast. Building apps by day, exploring cities by weekend.",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  WRITE: "/write",
  SETTINGS: "/settings",
  BOOKMARKS: "/bookmarks",
  TRENDING: "/trending",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  POST: "/post",
} as const;

export const COLORS = {
  muted: "#999",
  error: "red",
  gray: "gray",
  teal: "teal",
  green: "green",
} as const;

export const HERO_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80";

export const HERO_STATS = [
  { value: "50+", label: "Stories" },
  { value: "12", label: "Countries" },
  { value: "100+", label: "Dishes" },
] as const;

export const HERO_TECH = ["React", "Node.js", "MongoDB", "Express", "Docker"] as const;

export const PRESET_LOCATIONS: PresetLocation[] = [
  { name: "Paris, France", city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo, Japan", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "New York, USA", city: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { name: "London, UK", city: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Bali, Indonesia", city: "Bali", country: "Indonesia", lat: -8.3405, lng: 115.092 },
  { name: "Barcelona, Spain", city: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686 },
  { name: "Sydney, Australia", city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Dubai, UAE", city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Rome, Italy", city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Bangkok, Thailand", city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
];

export const REPORT_REASONS: ReportReason[] = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "harassment", label: "Harassment" },
  { value: "false-information", label: "False Information" },
  { value: "copyright", label: "Copyright Violation" },
  { value: "other", label: "Other" },
];
