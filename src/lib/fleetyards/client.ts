/**
 * FleetYards API Client
 *
 * Fetches all ships from the FleetYards public API via paginated GET requests.
 * Handles pagination (Link header + response length), retry with exponential
 * backoff on 5xx/network errors, and 429 rate-limit responses with Retry-After.
 *
 * This module uses native fetch only -- no external HTTP libraries required.
 */

import type { FleetYardsShipResponse } from './types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const FLEETYARDS_API_BASE = 'https://api.fleetyards.net/v1';

/** Maximum ships per page (FleetYards API cap) */
const PER_PAGE = 200;

/** Delay between page fetches to respect undocumented rate limits */
const PAGE_DELAY_MS = 300;

/** Maximum retry attempts per individual page fetch */
const MAX_RETRIES = 3;

/** Safety limit to prevent infinite pagination loops */
const MAX_PAGES = 10;

// ---------------------------------------------------------------------------
// Link Header Parser
// ---------------------------------------------------------------------------

/**
 * Parses an RFC 8288 Link header and extracts the `rel="next"` URL.
 *
 * Example input:
 *   `<https://api.fleetyards.net/v1/models?page=2&perPage=200>; rel="next"`
 *
 * @returns Object with optional `next` URL string.
 */
function parseLinkHeader(linkHeader: string | null): { next?: string } {
  if (!linkHeader) return {};

  const result: { next?: string } = {};
  const parts = linkHeader.split(',');

  for (const part of parts) {
    const urlMatch = part.match(/<([^>]+)>/);
    const relMatch = part.match(/rel="([^"]+)"/);

    if (urlMatch && relMatch && relMatch[1] === 'next') {
      result.next = urlMatch[1];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Fetch with Retry
// ---------------------------------------------------------------------------

/**
 * Fetches a URL with retry logic for transient failures.
 *
 * Retry policy:
 * - Network errors: retry with exponential backoff (1s, 2s, 3s)
 * - 5xx responses: retry with exponential backoff
 * - 429 (rate limited): wait Retry-After header value (or 5s default), then retry
 * - 4xx (not 429): do NOT retry -- these indicate a client-side problem
 *
 * @returns The Response object on success, or null after exhausting retries.
 */
async function fetchWithRetry(
  url: string,
  retries: number,
  page: number,
): Promise<Response | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      // Success
      if (response.ok) {
        return response;
      }

      // Rate limited -- respect Retry-After
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 5;
        const waitMs = (isNaN(retryAfterSeconds) ? 5 : retryAfterSeconds) * 1000;
        console.warn(
          `[ship-sync] Page ${page} rate limited (429). Waiting ${waitMs / 1000}s before retry ${attempt}/${retries}`,
        );
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      // Client error (not 429) -- do not retry
      if (response.status >= 400 && response.status < 500) {
        const body = await response.text().catch(() => '(no body)');
        console.warn(
          `[ship-sync] Page ${page} failed with ${response.status}: ${body}`,
        );
        return null;
      }

      // Server error (5xx) -- retry with backoff
      if (response.status >= 500) {
        const waitMs = 1000 * attempt;
        console.warn(
          `[ship-sync] Page ${page} server error (${response.status}). Retry ${attempt}/${retries} after ${waitMs}ms`,
        );
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      // Unexpected status -- treat as non-retryable
      const body = await response.text().catch(() => '(no body)');
      console.warn(
        `[ship-sync] Page ${page} unexpected status ${response.status}: ${body}`,
      );
      return null;
    } catch (error) {
      // Network error -- retry with backoff
      const waitMs = 1000 * attempt;
      console.warn(
        `[ship-sync] Page ${page} network error: ${error instanceof Error ? error.message : String(error)}. Retry ${attempt}/${retries} after ${waitMs}ms`,
      );
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  console.warn(`[ship-sync] Page ${page} failed after ${retries} retries`);
  return null;
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

/**
 * Fetches all ships from the FleetYards API with automatic pagination.
 *
 * Pagination strategy:
 * 1. Parse `Link` header for `rel="next"` URL
 * 2. If no Link header, check if response length < PER_PAGE (last page)
 * 3. Stop at MAX_PAGES as a safety limit
 *
 * @returns An object containing:
 *   - `ships`: Array of raw API response objects
 *   - `pagesProcessed`: Number of pages successfully fetched
 *   - `errors`: Array of error messages from failed pages
 */
export async function fetchAllShips(): Promise<{
  ships: FleetYardsShipResponse[];
  pagesProcessed: number;
  errors: string[];
}> {
  const allShips: FleetYardsShipResponse[] = [];
  const errors: string[] = [];
  let pagesProcessed = 0;
  let nextUrl: string | undefined =
    `${FLEETYARDS_API_BASE}/models?page=1&perPage=${PER_PAGE}`;
  let page = 1;

  while (nextUrl && page <= MAX_PAGES) {
    console.log(`[ship-sync] Fetching page ${page}...`);

    const response = await fetchWithRetry(nextUrl, MAX_RETRIES, page);

    if (!response) {
      const errorMsg = `Page ${page} failed after retries -- skipping`;
      errors.push(errorMsg);
      // Stop pagination if a page fails entirely (data may be incomplete)
      break;
    }

    let pageShips: FleetYardsShipResponse[];
    try {
      pageShips = (await response.json()) as FleetYardsShipResponse[];
    } catch (parseError) {
      const errorMsg = `Page ${page} JSON parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
      errors.push(errorMsg);
      console.warn(`[ship-sync] ${errorMsg}`);
      break;
    }

    // Empty response means no more data
    if (!Array.isArray(pageShips) || pageShips.length === 0) {
      console.log(`[ship-sync] Page ${page}: empty response, pagination complete`);
      break;
    }

    allShips.push(...pageShips);
    pagesProcessed++;
    console.log(`[ship-sync] Page ${page}: ${pageShips.length} ships`);

    // Determine if there are more pages
    const linkHeader = response.headers.get('Link');
    const links = parseLinkHeader(linkHeader);

    if (links.next) {
      // Link header provides the next URL directly
      nextUrl = links.next;
    } else if (pageShips.length < PER_PAGE) {
      // Response smaller than page size -- this was the last page
      nextUrl = undefined;
    } else {
      // No Link header but full page -- construct next URL manually
      nextUrl = `${FLEETYARDS_API_BASE}/models?page=${page + 1}&perPage=${PER_PAGE}`;
    }

    page++;

    // Delay between pages to respect rate limits
    if (nextUrl && page <= MAX_PAGES) {
      await new Promise((r) => setTimeout(r, PAGE_DELAY_MS));
    }
  }

  if (page > MAX_PAGES) {
    const errorMsg = `Reached MAX_PAGES limit (${MAX_PAGES}) -- pagination stopped as safety measure`;
    errors.push(errorMsg);
    console.warn(`[ship-sync] ${errorMsg}`);
  }

  console.log(
    `[ship-sync] Fetch complete: ${allShips.length} ships from ${pagesProcessed} pages`,
  );

  return { ships: allShips, pagesProcessed, errors };
}
