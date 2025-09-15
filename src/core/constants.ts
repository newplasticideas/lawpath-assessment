/**
 * Core constants used throughout the application.
 */

export const VALID_STATES = [
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "WA",
  "TAS",
  "NT",
  "ACT",
] as const;

export const LONG_STATE: Record<(typeof VALID_STATES)[number], string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
  ACT: "Australian Capital Territory",
};

export const SESSION_COOKIE = "lp_sess";
export const JWT_DEFAULT_TTL_SEC = 60 * 60 * 8 * 1000; // 8 hours
export const JWT_SHORT_TTL_SEC = 60 * 5 * 1000; // 5 minutes

export const ERR_USERNAME_TAKEN = "Username taken";
export const ERR_INVALID_CREDENTIALS = "Invalid credentials";
