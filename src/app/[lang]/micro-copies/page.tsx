import type { Metadata } from "next";
import { adapto } from "@/lib/adapto-sdk";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: "Micro Copies" };

export default async function MicroCopiesPage({ params }: Props) {
  const { lang } = await params;

  const allItems = await adapto.microCopy.list({ language: lang });
  const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
  const items = allItems.slice(0, PAGE_SIZE);

  return (
    <main className="container">
      <h1 className="page-title">Micro Copies</h1>
      <div className="microcopy-list">
        {items.map((item) => (
          <div key={item.id} className="microcopy-item">
            <span className="microcopy-key">{item.key}</span>
            <span className="microcopy-value">{item.value}</span>
          </div>
        ))}
      </div>
      <Pagination currentPage={1} totalPages={totalPages} basePath={`/${lang}/micro-copies`} />
    </main>
  );
}
