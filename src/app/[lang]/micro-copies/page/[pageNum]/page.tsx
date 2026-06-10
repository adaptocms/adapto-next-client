import { notFound } from "next/navigation";
import { adapto } from "@/lib/adapto";
import { PAGE_SIZE } from "@/config";
import Pagination from "@/components/Pagination";

type Props = { params: Promise<{ lang: string; pageNum: string }> };

export async function generateStaticParams({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const allItems = await adapto.microCopy.list({ language: lang });
  const totalPages = Math.ceil(allItems.length / PAGE_SIZE);

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    pageNum: String(i + 2),
  }));
}

export default async function MicroCopiesPage({ params }: Props) {
  const { lang, pageNum } = await params;
  const currentPage = Math.max(2, parseInt(pageNum, 10));

  const allItems = await adapto.microCopy.list({ language: lang });
  const totalPages = Math.ceil(allItems.length / PAGE_SIZE);

  if (currentPage > totalPages) notFound();

  const items = allItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/${lang}/micro-copies`} />
    </main>
  );
}
