import type { Metadata } from "next";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage({ params }: Props) {
  const { lang } = await params;

  const { items: categories, pages: totalPages } = await adapto.categories.list({
    language: lang,
    page: 1,
    limit: PAGE_SIZE,
  });

  return (
    <main className="container">
      <h1 className="page-title">Categories</h1>
      <ul className="content-list">
        {categories.map((category) => (
          <li key={category.id}>
            <a href={`/${lang}/articles/categories/${category.slug}`}>
              {category.name}
            </a>
          </li>
        ))}
      </ul>
      <Pagination currentPage={1} totalPages={totalPages} basePath={`/${lang}/articles/categories`} />
    </main>
  );
}
