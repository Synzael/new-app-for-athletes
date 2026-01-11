/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

  return formatDate(d);
}

/**
 * Get star rating label based on rating value
 */
export function getStarRatingLabel(rating: number): string {
  if (rating >= 4.5) return "Elite NIL Prospect";
  if (rating >= 4) return "Power 5 Ready";
  if (rating >= 3.5) return "D1 Potential";
  if (rating >= 3) return "Solid College Athlete";
  if (rating >= 2.5) return "Developmental";
  return "Early Stage";
}

/**
 * Get color for star rating
 */
export function getStarRatingColor(rating: number): string {
  if (rating >= 4.5) return "#22c55e"; // green
  if (rating >= 4) return "#3b82f6"; // blue
  if (rating >= 3.5) return "#8b5cf6"; // purple
  if (rating >= 3) return "#f59e0b"; // amber
  return "#6b7280"; // gray
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format height string (e.g., "6'2")
 */
export function formatHeight(feet: number, inches: number): string {
  return `${feet}'${inches}"`;
}

/**
 * Parse height string to feet and inches
 */
export function parseHeight(height: string): { feet: number; inches: number } | null {
  const match = height.match(/(\d+)'(\d+)?/);
  if (!match) return null;
  return {
    feet: parseInt(match[1], 10),
    inches: parseInt(match[2] || "0", 10),
  };
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
