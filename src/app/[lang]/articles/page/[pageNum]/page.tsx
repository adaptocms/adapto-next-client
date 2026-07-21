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
    adapto.articles.list({
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

export default async function ArticlesPage({ params }: Props) {
  const { lang, pageNum } = await params;
  const currentPage = Math.max(2, parseInt(pageNum, 10));

  const [{ items, pages: totalPages }, { items: categories }] = await Promise.all([
    listWithDrafts(
      () =>
        adapto.articles.list({
          language: lang,
          status: "published",
          field: "published_at",
          order: "desc",
          page: currentPage,
          limit: PAGE_SIZE,
        }),
      (status) =>
        adapto.articles.listAll({ language: lang, status, field: "published_at", order: "desc" }),
      currentPage,
      PAGE_SIZE,
      (a, b) =>
        String(b.published_at ?? b.created_at ?? "").localeCompare(
          String(a.published_at ?? a.created_at ?? ""),
        ),
    ),
    guardedList(() => adapto.categories.list({ language: lang, limit: 100 })),
  ]);

  if (currentPage > totalPages) notFound();

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
                  <DraftBadge status={article.status} />
                </li>
              ))}
            </ul>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/${lang}/articles`}
          />
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
