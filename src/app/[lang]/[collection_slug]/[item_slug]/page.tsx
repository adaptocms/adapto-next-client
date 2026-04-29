import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto-sdk";
import { hydrateMediaPlacements } from "@/lib/hydrateMediaPlacements";

type Props = {
  params: Promise<{ lang: string; collection_slug: string; item_slug: string }>;
};

export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const collections = await adapto.collections.listAll({ language: lang });

  const results = await Promise.all(
    collections.map(async (collection) => {
      const items = await adapto.collections.listAllItems(collection.id, {
        language: lang,
        status: "published",
      });
      return items.map((item) => ({
        collection_slug: collection.slug,
        item_slug: item.slug,
      }));
    }),
  );

  return results.flat();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection_slug, item_slug } = await params;
  const collection = await adapto.collections
    .getBySlug(collection_slug)
    .catch(() => null);
  if (!collection) return {};
  const item = await adapto.collections
    .getItemBySlug(collection.id, item_slug)
    .catch(() => null);
  return { title: item?.title };
}

export default async function CollectionItemPage({ params }: Props) {
  const { lang, collection_slug, item_slug } = await params;

  const collection = await adapto.collections
    .getBySlug(collection_slug)
    .catch(() => null);

  if (!collection) notFound();

  const item = await adapto.collections
    .getItemBySlug(collection.id, item_slug)
    .catch(() => null);

  if (!item) notFound();

  return (
    <main className="container">
      <h1 className="page-title">{item.title}</h1>
      <div className="item-fields">
        {collection.fields.map((field) => {
          const value = item.data[field.name];
          if (value === null || value === undefined || value === "") return null;

          return (
            <div key={field.name}>
              <h3 className="item-field-label">{field.label}</h3>
              {field.type === "rich_text" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: hydrateMediaPlacements(
                      String(value),
                      item.media_objects_placements,
                    ),
                  }}
                />
              ) : field.type === "url" || field.type === "email" ? (
                <a href={String(value)} className="item-field-value">
                  {String(value)}
                </a>
              ) : (
                <p className="item-field-value">{String(value)}</p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
