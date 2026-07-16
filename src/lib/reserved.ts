// Route segments that this template hand-renders under `[lang]/`. A custom collection
// whose slug matches one of these is shadowed by the static route (Next resolves the named
// folder before the `[collection_slug]` catch-all), so it never renders — a silent break.
export const RESERVED_SLUGS = ["articles", "collections", "micro-copies", "pages"];

// Pure: which of the given collection slugs collide with a reserved route. Deduped.
export function findReservedCollisions(slugs: string[]): string[] {
  return [...new Set(slugs)].filter((slug) => RESERVED_SLUGS.includes(slug));
}

// Warn once per slug (build/dev logs) so a collision is caught before it confuses anyone.
// Non-fatal: it flags the problem, it doesn't fail the build.
const warned = new Set<string>();
export function warnReservedCollisions(slugs: string[]): void {
  for (const slug of findReservedCollisions(slugs)) {
    if (warned.has(slug)) continue;
    warned.add(slug);
    console.warn(
      `[adapto] Custom collection "${slug}" collides with the reserved /${slug} route ` +
        `and will not be reachable. Rename the collection's slug in Adapto CMS.`,
    );
  }
}
