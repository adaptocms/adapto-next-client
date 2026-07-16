import type { PaginatedResponse } from "adapto-client-sdk";
import { API_URL, API_KEY } from "../config";

function isConfigured(url: string, key: string): boolean {
  return url.trim() !== "" && key.trim() !== "";
}

// True only when both the API URL and key are set. When false the SDK is never called
// and loaders return empty data, so an unconfigured scaffold renders onboarding instead
// of crashing the dev server or the build (the SDK throws "Invalid URL" on an empty base).
export const IS_CONFIGURED = isConfigured(API_URL, API_KEY);

// `next build` runs with NODE_ENV=production; `next dev` with development.
const IS_PROD = process.env.NODE_ENV === "production";

async function guard<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  if (!IS_CONFIGURED) return fallback;
  try {
    return await load();
  } catch (err) {
    // Configured but the SDK/CMS errored. Degrade to empty in dev so a flaky CMS doesn't
    // block work; in a production build re-throw so a genuinely broken build fails loudly
    // instead of silently shipping an empty site.
    if (IS_PROD) throw err;
    console.warn(
      "[adapto] Content fetch failed — rendering empty. " +
        "Check ADAPTO_API_URL and ADAPTO_API_KEY in .env.",
      err,
    );
    return fallback;
  }
}

// Wrap a paginated list endpoint (`.list`, `.listItems`). Unconfigured/errored → empty page.
export function guardedList<T>(
  load: () => Promise<PaginatedResponse<T>>,
): Promise<PaginatedResponse<T>> {
  return guard(load, { items: [] as T[], total: 0, page: 1, limit: 0, pages: 0 });
}

// Wrap an array endpoint (`.listAll`, `microCopy.list`, `languages.list`). → empty array.
export function guardedAll<T>(load: () => Promise<T[]>): Promise<T[]> {
  return guard(load, [] as T[]);
}
