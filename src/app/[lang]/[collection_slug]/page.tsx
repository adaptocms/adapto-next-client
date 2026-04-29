import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto-sdk";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string; collection_slug: string }> };

export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const collections = await adapto.collections.listAll({ language: lang });
  return collections.map((c) => ({ collection_slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection_slug } = await params;
  const collection = await adapto.collections
    .getBySlug(collection_slug)
    .catch(() => null);
  return { title: collection?.name };
}

export default async function CollectionPage({ params }: Props) {
  const { lang, collection_slug } = await params;

  const collection = await adapto.collections
    .getBySlug(collection_slug)
    .catch(() => null);

  if (!collection) notFound();

  const { items, pages: totalPages } = await adapto.collections.listItems(
    collection.id,
    { language: lang, status: "published", page: 1, limit: PAGE_SIZE },
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
      <Pagination currentPage={1} totalPages={totalPages} basePath={`/${lang}/${collection_slug}`} />
    </main>
  );
}
