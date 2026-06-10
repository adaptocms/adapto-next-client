import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";


export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const categories = await adapto.categories.listAll({ language: lang });
  return categories.filter((c) => c.slug).map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const category = await adapto.categories.getBySlug(slug).catch(() => null);
  if (!category) notFound();

  const { items: articles, pages: totalPages } = await adapto.articles.list({
    language: lang,
    status: "published",
    category: category.id,
    page: 1,
    limit: PAGE_SIZE,
  });

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
        currentPage={1}
        totalPages={totalPages}
        basePath={`/${lang}/articles/categories/${slug}`}
      />
    </main>
  );
}
