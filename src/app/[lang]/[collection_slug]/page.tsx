import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";
import DraftBadge from "@/components/DraftBadge";
import { guardedList, guardedAll, listWithDrafts } from "@/lib/loaders";
import { warnReservedCollisions, isReserved } from "@/lib/reserved";


export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const collections = await guardedAll(() => adapto.customCollections.listAll({ language: lang }));
  warnReservedCollisions(collections.map((c) => c.slug));
  return collections
    .filter((c) => c.slug && !isReserved(c.slug))
    .map((c) => ({ collection_slug: c.slug }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: string; collection_slug: string }>;
}) {
  const { lang, collection_slug } = await params;
  // Reserved slugs never get a static route; guard the on-demand path too (dynamicParams is on).
  if (isReserved(collection_slug)) notFound();
  const collection = await adapto.customCollections.getBySlug(collection_slug).catch(() => null);
  if (!collection) notFound();

  const { items, pages: totalPages } = await listWithDrafts(
    () =>
      adapto.customCollections.listItems(collection.id, {
        language: lang,
        status: "published",
        page: 1,
        limit: PAGE_SIZE,
      }),
    (status) =>
      adapto.customCollections.listAllItems(collection.id, { language: lang, status }),
    1,
    PAGE_SIZE,
  );

  return (
    <main className="container">
      <h1 className="page-title">{collection.name}</h1>
      <ul className="content-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`/${lang}/${collection_slug}/${item.slug}`}>{item.title}</a>
            <DraftBadge status={item.status} />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={1}
        totalPages={totalPages}
        basePath={`/${lang}/${collection_slug}`}
      />
    </main>
  );
}
