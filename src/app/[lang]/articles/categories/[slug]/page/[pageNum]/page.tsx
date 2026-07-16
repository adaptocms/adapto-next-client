import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";
import { guardedList, guardedAll } from "@/lib/loaders";


export async function generateStaticParams({
  params: { lang, slug },
}: {
  params: { lang: string; slug: string };
}) {
  const categories = await guardedAll(() => adapto.categories.listAll({ language: lang }));
  const category = categories.find((c) => c.slug === slug);
  if (!category) return [];

  const { pages: totalPages } = await guardedList(() =>
    adapto.articles.list({
      language: lang,
      status: "published",
      category: category.id,
      page: 1,
      limit: PAGE_SIZE,
    }),
  );

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    pageNum: String(i + 2),
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string; pageNum: string }>;
}) {
  const { lang, slug, pageNum } = await params;
  const currentPage = Math.max(2, parseInt(pageNum, 10));

  const category = await adapto.categories.getBySlug(slug).catch(() => null);
  if (!category) notFound();

  const { items: articles, pages: totalPages } = await guardedList(() =>
    adapto.articles.list({
      language: lang,
      status: "published",
      category: category.id,
      page: currentPage,
      limit: PAGE_SIZE,
    }),
  );

  if (currentPage > totalPages) notFound();

  return (
    <main className="container">
      <h1 className="page-title">{category.name}</h1>
      {category.description && (
        <p className="category-description">{category.description}</p>
      )}
      <ul className="content-list">
        {articles.map((article) => (
          <li key={article.id}>
            <a href={`/${lang}/articles/${article.slug}`}>{article.title}</a>
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/${lang}/articles/categories/${slug}`}
      />
    </main>
  );
}
