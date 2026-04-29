import type { Metadata } from "next";
import { adapto } from "@/lib/adapto-sdk";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: "Pages" };

export default async function PagesPage({ params }: Props) {
  const { lang } = await params;

  const { items, pages: totalPages } = await adapto.pages.list({
    language: lang,
    status: "published",
    page: 1,
    limit: PAGE_SIZE,
  });

  return (
    <main className="container">
      <h1 className="page-title">Pages</h1>
      <ul className="content-list">
        {items.map((page) => (
          <li key={page.id}>
            <a href={`/${lang}/pages/${page.slug}`}>{page.title}</a>
          </li>
        ))}
      </ul>
      <Pagination currentPage={1} totalPages={totalPages} basePath={`/${lang}/pages`} />
    </main>
  );
}
