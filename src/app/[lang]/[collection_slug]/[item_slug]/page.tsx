import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import { guardedAll } from "@/lib/loaders";
import { isReserved } from "@/lib/reserved";
import { hydrateMediaPlacements } from "adapto-client-sdk";


export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const collections = await guardedAll(() => adapto.customCollections.listAll({ language: lang }));

  const results = await Promise.all(
    collections.filter((c) => c.slug && !isReserved(c.slug)).map(async (collection) => {
      const items = await guardedAll(() =>
        adapto.customCollections.listAllItems(collection.id, {
          language: lang,
          status: "published",
        }),
      );
      return items
        .filter((item) => item.slug)
        .map((item) => ({
          collection_slug: collection.slug,
          item_slug: item.slug,
        }));
    }),
  );

  return results.flat();
}

export default async function CollectionItemPage({
  params,
}: {
  params: Promise<{ lang: string; collection_slug: string; item_slug: string }>;
}) {
  const { collection_slug, item_slug } = await params;
  if (isReserved(collection_slug)) notFound();

  const collection = await adapto.customCollections.getBySlug(collection_slug).catch(() => null);
  if (!collection) notFound();

  const item = await adapto.customCollections.getItemBySlug(collection.id, item_slug).catch(() => null);
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
