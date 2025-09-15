"use client";
import { useState, useEffect } from "react";

/**
 * React hook for persistent state synced with localStorage.
 *
 * @param key - The localStorage key to use.
 * @param initial - The initial value if nothing is stored.
 * @returns A tuple [value, setValue] like useState, but persists to localStorage.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    return getLocalStorage(key, initial);
  });

  useEffect(() => {
    setLocalStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

/**
 * Gets a value from localStorage, or returns a fallback if not found or unavailable.
 *
 * @param key - The localStorage key to read.
 * @param fallback - The value to return if nothing is stored or on error.
 * @returns The parsed value from localStorage, or the fallback.
 */
export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Sets a value in localStorage.
 *
 * @param key - The localStorage key to write.
 * @param value - The value to store (will be JSON stringified).
 */
export function setLocalStorage<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}
