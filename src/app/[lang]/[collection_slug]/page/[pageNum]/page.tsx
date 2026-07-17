import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";
import { guardedList, guardedAll } from "@/lib/loaders";
import { isReserved } from "@/lib/reserved";


export async function generateStaticParams({
  params: { lang, collection_slug },
}: {
  params: { lang: string; collection_slug: string };
}) {
  if (collection_slug && isReserved(collection_slug)) return [];
  const collections = await guardedAll(() => adapto.customCollections.listAll({ language: lang }));
  const collection = collections.find((c) => c.slug === collection_slug);
  if (!collection) return [];

  const { pages: totalPages } = await guardedList(() =>
    adapto.customCollections.listItems(collection.id, {
      language: lang,
      status: "published",
      page: 1,
      limit: PAGE_SIZE,
    }),
  );

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    pageNum: String(i + 2),
  }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: string; collection_slug: string; pageNum: string }>;
}) {
  const { lang, collection_slug, pageNum } = await params;
  if (isReserved(collection_slug)) notFound();
  const currentPage = Math.max(2, parseInt(pageNum, 10));

  const collection = await adapto.customCollections.getBySlug(collection_slug).catch(() => null);
  if (!collection) notFound();

  const { items, pages: totalPages } = await guardedList(() =>
    adapto.customCollections.listItems(collection.id, {
      language: lang,
      status: "published",
      page: currentPage,
      limit: PAGE_SIZE,
    }),
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/${lang}/${collection_slug}`}
      />
    </main>
  );
}
