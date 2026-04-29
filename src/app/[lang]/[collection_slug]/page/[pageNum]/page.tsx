import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto-sdk";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string; collection_slug: string; pageNum: string }> };

export async function generateStaticParams({
  params: { lang, collection_slug },
}: {
  params: { lang: string; collection_slug: string };
}) {
  const collection = await adapto.collections
    .getBySlug(collection_slug)
    .catch(() => null);
  if (!collection) return [];

  const { pages: totalPages } = await adapto.collections.listItems(
    collection.id,
    { language: lang, status: "published", page: 1, limit: PAGE_SIZE },
  );

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    pageNum: String(i + 2),
  }));
}

export default async function CollectionPage({ params }: Props) {
  const { lang, collection_slug, pageNum } = await params;
  const currentPage = Math.max(2, parseInt(pageNum, 10));

  const collection = await adapto.collections
    .getBySlug(collection_slug)
    .catch(() => null);

  if (!collection) notFound();

  const { items, pages: totalPages } = await adapto.collections.listItems(
    collection.id,
    { language: lang, status: "published", page: currentPage, limit: PAGE_SIZE },
  );

  if (currentPage > totalPages) notFound();

  return (
    <main className="container">
      <h1 className="page-title">{collection.name}</h1>
      <ul className="content-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`/${lang}/${collection_slug}/${item.slug}`}>{item.title}</a>
          </li>
        ))}
      </ul>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/${lang}/${collection_slug}`} />
    </main>
  );
}
