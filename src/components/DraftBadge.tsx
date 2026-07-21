// Small "Draft" indicator shown next to unpublished content. Drafts are only
// fetched while running `next dev` (see listWithDrafts in src/lib/loaders.ts) and
// draft detail pages 404 in production, so this never renders in a live build.
export default function DraftBadge({ status }: { status?: string | null }) {
  if (status !== "draft") return null;
  return (
    <span
      title="Draft — visible only in local development"
      style={{
        display: "inline-block",
        marginLeft: "0.5em",
        padding: "0.15em 0.5em",
        borderRadius: "999px",
        fontSize: "0.7em",
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "#8a5a00",
        background: "#fff4d6",
        border: "1px solid #f0d38a",
        verticalAlign: "middle",
      }}
    >
      Draft
    </span>
  );
}
