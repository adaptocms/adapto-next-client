import type { Metadata } from "next";
import { adapto } from "@/lib/adapto";
import { guardedList, guardedAll } from "@/lib/loaders";

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: "Overview" };

export default async function HomePage({ params }: Props) {
  const { lang } = await params;

  const [pagesRes, articlesRes, collectionsRes, microCopies] =
    await Promise.all([
      guardedList(() => adapto.pages.list({ language: lang, status: "published", limit: 10 })),
      guardedList(() => adapto.articles.list({ language: lang, status: "published", limit: 10 })),
      guardedList(() => adapto.customCollections.list({ language: lang, limit: 10 })),
      guardedAll(() => adapto.microCopy.list({ language: lang })),
    ]);

  const topMicroCopies = microCopies.slice(0, 10);

  return (
    <main className="container">
      <h1 className="page-title">Content Overview</h1>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Pages</h2>
          <a href={`/${lang}/pages`} className="view-all">
            View all {pagesRes.total}
          </a>
        </div>
        <ul className="content-list">
          {pagesRes.items.map((page) => (
            <li key={page.id}>
              <a href={`/${lang}/pages/${page.slug}`}>{page.title}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Articles</h2>
          <a href={`/${lang}/articles`} className="view-all">
            View all {articlesRes.total}
          </a>
        </div>
        <ul className="content-list">
          {articlesRes.items.map((article) => (
            <li key={article.id}>
              <a href={`/${lang}/articles/${article.slug}`}>{article.title}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Collections</h2>
          <a href={`/${lang}/collections`} className="view-all">
            View all {collectionsRes.total}
          </a>
        </div>
        <ul className="content-list">
          {collectionsRes.items.map((collection) => (
            <li key={collection.id}>
              <a href={`/${lang}/${collection.slug}`}>{collection.name}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Micro Copies</h2>
          <a href={`/${lang}/micro-copies`} className="view-all">
            View all {microCopies.length}
          </a>
        </div>
        <div className="microcopy-list">
          {topMicroCopies.map((item) => (
            <div key={item.id} className="microcopy-item">
              <span className="microcopy-key">{item.key}</span>
              <span className="microcopy-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
