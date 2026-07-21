import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";
import DraftBadge from "@/components/DraftBadge";
import { guardedList, listWithDrafts } from "@/lib/loaders";

type Props = { params: Promise<{ lang: string; pageNum: string }> };

export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const { pages: totalPages } = await guardedList(() =>
    adapto.pages.list({
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

export default async function PagesPage({ params }: Props) {
  const { lang, pageNum } = await params;
  const currentPage = Math.max(2, parseInt(pageNum, 10));

  const { items, pages: totalPages } = await listWithDrafts(
    () =>
      adapto.pages.list({
        language: lang,
        status: "published",
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    (status) => adapto.pages.listAll({ language: lang, status }),
    currentPage,
    PAGE_SIZE,
  );

  if (currentPage > totalPages) notFound();

  return (
    <main className="container">
      <h1 className="page-title">Pages</h1>
      <ul className="content-list">
        {items.map((page) => (
          <li key={page.id}>
            <a href={`/${lang}/pages/${page.slug}`}>{page.title}</a>
            <DraftBadge status={page.status} />
          </li>
        ))}
      </ul>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/${lang}/pages`} />
    </main>
  );
}
