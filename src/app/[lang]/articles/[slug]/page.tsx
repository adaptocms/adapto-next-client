import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto-sdk";
import { hydrateMediaPlacements } from "@/lib/hydrateMediaPlacements";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const articles = await adapto.articles.listAll({
    language: lang,
    status: "published",
  });
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await adapto.articles.getBySlug(slug).catch(() => null);
  return {
    title: article?.title,
    description: article?.summary,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  const article = await adapto.articles.getBySlug(slug).catch(() => null);

  if (!article) notFound();

  const content = hydrateMediaPlacements(
    article.content,
    article.media_objects_placements,
  );

  return (
    <main>
      <article>
        <h1>{article.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </main>
  );
}
