import type { Metadata } from "next";
import { adapto } from "@/lib/adapto-sdk";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: "Articles" };

export default async function ArticlesPage({ params }: Props) {
  const { lang } = await params;

  const { items, pages: totalPages } = await adapto.articles.list({
    language: lang,
    status: "published",
    page: 1,
    limit: PAGE_SIZE,
  });

  return (
    <main className="container">
      <h1 className="page-title">Articles</h1>
      <ul className="content-list">
        {items.map((article) => (
          <li key={article.id}>
            <a href={`/${lang}/articles/${article.slug}`}>{article.title}</a>
          </li>
        ))}
      </ul>
      <Pagination currentPage={1} totalPages={totalPages} basePath={`/${lang}/articles`} />
    </main>
  );
}
