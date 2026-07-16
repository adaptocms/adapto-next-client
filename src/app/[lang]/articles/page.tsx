import type { Metadata } from "next";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";
import { guardedList } from "@/lib/loaders";

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: "Articles" };

export default async function ArticlesPage({ params }: Props) {
  const { lang } = await params;

  const [{ items, pages: totalPages }, { items: categories }] = await Promise.all([
    guardedList(() =>
      adapto.articles.list({
        language: lang,
        status: "published",
        field: "published_at",
        order: "desc",
        page: 1,
        limit: PAGE_SIZE,
      }),
    ),
    guardedList(() => adapto.categories.list({ language: lang, limit: 100 })),
  ]);

  return (
    <main className="container">
      <h1 className="page-title">Articles</h1>
      <div className="articles-layout">
        <div>
          {items.length === 0 ? (
            <p className="muted-note">No articles yet.</p>
          ) : (
            <ul className="content-list">
              {items.map((article) => (
                <li key={article.id}>
                  <a href={`/${lang}/articles/${article.slug}`}>{article.title}</a>
                </li>
              ))}
            </ul>
          )}
          <Pagination currentPage={1} totalPages={totalPages} basePath={`/${lang}/articles`} />
        </div>

        <aside className="articles-sidebar">
          <h2 className="sidebar-title">Categories</h2>
          {categories.length === 0 ? (
            <p className="muted-note">No categories yet.</p>
          ) : (
            <ul className="content-list">
              {categories.map((category) => (
                <li key={category.id}>
                  <a href={`/${lang}/articles/categories/${category.slug}`}>
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
