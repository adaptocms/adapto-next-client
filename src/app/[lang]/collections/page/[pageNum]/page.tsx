import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto-sdk";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string; pageNum: string }> };

export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const { pages: totalPages } = await adapto.collections.list({
    language: lang,
    page: 1,
    limit: PAGE_SIZE,
  });

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    pageNum: String(i + 2),
  }));
}

export default async function CollectionsPage({ params }: Props) {
  const { lang, pageNum } = await params;
  const currentPage = Math.max(2, parseInt(pageNum, 10));

  const { items, pages: totalPages } = await adapto.collections.list({
    language: lang,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  if (currentPage > totalPages) notFound();

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
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/${lang}/collections`} />
    </main>
  );
}
