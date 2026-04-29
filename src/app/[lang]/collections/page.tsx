import type { Metadata } from "next";
import { adapto } from "@/lib/adapto-sdk";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage({ params }: Props) {
  const { lang } = await params;

  const { items, pages: totalPages } = await adapto.collections.list({
    language: lang,
    page: 1,
    limit: PAGE_SIZE,
  });

  return (
    <main className="container">
      <h1 className="page-title">Collections</h1>
      <ul className="content-list">
        {items.map((collection) => (
          <li key={collection.id}>
            <a href={`/${lang}/${collection.slug}`}>{collection.name}</a>
          </li>
        ))}
      </ul>
      <Pagination currentPage={1} totalPages={totalPages} basePath={`/${lang}/collections`} />
    </main>
  );
}
