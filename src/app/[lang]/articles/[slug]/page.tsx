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
  const articles = await guardedAll(() =>
    adapto.articles.listAll({ language: lang, status: "published" }),
  );
  return articles.filter((a) => a.slug).map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { slug } = await params;
  const article = await adapto.articles.getBySlug(slug).catch(() => null);
  if (!article) notFound();
  // Drafts are previewable in `next dev`, but never served from a production build.
  if (IS_PROD && article.status !== "published") notFound();

  const content = hydrateMediaPlacements(
    article.content,
    article.media_objects_placements,
  );

  return (
    <main>
      <article>
        <h1>{article.title} <DraftBadge status={article.status} /></h1>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </main>
  );
}
