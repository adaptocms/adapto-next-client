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
  const { items } = await adapto.pages.list({ language: lang, status: "published" });
  return items.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await adapto.pages.getBySlug(slug).catch(() => null);
  return { title: page?.title };
}

export default async function PageDetail({ params }: Props) {
  const { slug } = await params;
  const page = await adapto.pages.getBySlug(slug).catch(() => null);

  if (!page) notFound();

  const content = hydrateMediaPlacements(
    page.content,
    page.media_objects_placements,
  );

  return (
    <main className="container">
      <h1 className="page-title">{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </main>
  );
}
