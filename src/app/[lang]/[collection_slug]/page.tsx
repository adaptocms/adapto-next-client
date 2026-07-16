import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";
import { guardedList, guardedAll } from "@/lib/loaders";


export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const collections = await guardedAll(() => adapto.customCollections.listAll({ language: lang }));
  return collections.filter((c) => c.slug).map((c) => ({ collection_slug: c.slug }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: string; collection_slug: string }>;
}) {
  const { lang, collection_slug } = await params;
  const collection = await adapto.customCollections.getBySlug(collection_slug).catch(() => null);
  if (!collection) notFound();

  const { items, pages: totalPages } = await guardedList(() =>
    adapto.customCollections.listItems(collection.id, {
      language: lang,
      status: "published",
      page: 1,
      limit: PAGE_SIZE,
    }),
  );

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
        currentPage={1}
        totalPages={totalPages}
        basePath={`/${lang}/${collection_slug}`}
      />
    </main>
  );
}
