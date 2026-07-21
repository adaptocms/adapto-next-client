import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import DraftBadge from "@/components/DraftBadge";
import { guardedAll, IS_PROD } from "@/lib/loaders";
import { hydrateMediaPlacements } from "adapto-client-sdk";


export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const pages = await guardedAll(() =>
    adapto.pages.listAll({ language: lang, status: "published" }),
  );
  return pages.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export default async function PageDetail({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { slug } = await params;
  const page = await adapto.pages.getBySlug(slug).catch(() => null);
  if (!page) notFound();
  // Drafts are previewable in `next dev`, but never served from a production build.
  if (IS_PROD && page.status !== "published") notFound();

  const content = hydrateMediaPlacements(
    page.content,
    page.media_objects_placements,
  );

  return (
    <main className="container">
      <h1 className="page-title">{page.title} <DraftBadge status={page.status} /></h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </main>
  );
}
