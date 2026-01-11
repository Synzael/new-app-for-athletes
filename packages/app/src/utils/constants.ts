// App constants

export const APP_NAME = "Athlete Recruiting";
export const APP_VERSION = "1.0.0";

// API Configuration
export const API_TIMEOUT = 10000; // 10 seconds

// Validation limits
export const BIO_MAX_LENGTH = 500;
export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_MAX_LENGTH = 255;

// Sports list
export const SPORTS = [
  "Football",
  "Basketball",
  "Baseball",
  "Soccer",
  "Volleyball",
  "Track & Field",
  "Swimming",
  "Wrestling",
  "Tennis",
  "Golf",
  "Lacrosse",
  "Hockey",
  "Softball",
  "Other",
] as const;

export type Sport = (typeof SPORTS)[number];

// User roles
export const USER_ROLES = {
  ATHLETE: "athlete",
  COACH: "coach",
  BRAND: "brand",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Rating thresholds
export const RATING_THRESHOLDS = {
  ELITE: { min: 4.5, label: "Elite NIL Prospect" },
  POWER5: { min: 4.0, label: "Power 5 Ready" },
  D1: { min: 3.5, label: "D1 Potential" },
  SOLID: { min: 3.0, label: "Solid College Athlete" },
  DEVELOPMENTAL: { min: 2.5, label: "Developmental" },
  EARLY: { min: 0, label: "Early Stage" },
} as const;

// Colors
export const COLORS = {
  primary: "#4f46e5",
  secondary: "#6b7280",
  background: "#1a1a2e",
  card: "#2d2d44",
  border: "#3d3d5c",
  text: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  star: "#fbbf24",
} as const;
