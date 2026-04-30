import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto-sdk";
import { hydrateMediaPlacements } from "@/lib/hydrateMediaPlacements";


export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const pages = await adapto.pages.listAll({ language: lang, status: "published" });
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
