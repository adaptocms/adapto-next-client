import type { Metadata } from "next";
import { adapto } from "@/lib/adapto";
import DraftBadge from "@/components/DraftBadge";
import { guardedList, guardedAll, IS_CONFIGURED, listWithDrafts } from "@/lib/loaders";
import { isReserved } from "@/lib/reserved";

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: "Overview" };

// Dev-only first-run guidance — never rendered in a production build.
const IS_DEV = process.env.NODE_ENV === "development";

export default async function HomePage({ params }: Props) {
  const { lang } = await params;

  const [pagesRes, articlesRes, collectionsRes, microCopies] =
    await Promise.all([
      listWithDrafts(
        () => adapto.pages.list({ language: lang, status: "published", limit: 10 }),
        (status) => adapto.pages.listAll({ language: lang, status }),
        1,
        10,
      ),
      listWithDrafts(
        () => adapto.articles.list({ language: lang, status: "published", limit: 10 }),
        (status) => adapto.articles.listAll({ language: lang, status }),
        1,
        10,
      ),
      guardedList(() => adapto.customCollections.list({ language: lang, limit: 10 })),
      guardedAll(() => adapto.microCopy.list({ language: lang })),
    ]);

  const topMicroCopies = microCopies.slice(0, 10);
  // ponytail: reserved `_*` collections are internal; total may still count them (exact
  // filtering would need a full listAll), but they never appear in the list or link out.
  const collections = collectionsRes.items.filter((c) => !isReserved(c.slug));

  return (
    <main className="container">
      {IS_DEV &&
        (IS_CONFIGURED ? (
          <p className="dev-note">
            Static site: content changes show up after you restart the dev server or
            rebuild.
          </p>
        ) : (
          <p className="dev-note">
            <strong>Not connected to Adapto CMS.</strong> Add ADAPTO_API_URL and
            ADAPTO_API_KEY to your <code>.env</code>, then restart the dev server.
          </p>
        ))}

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
              <DraftBadge status={page.status} />
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
              <DraftBadge status={article.status} />
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
          {collections.map((collection) => (
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
