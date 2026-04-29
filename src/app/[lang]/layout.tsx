import Navbar from "@/components/Navbar";
import { getLanguages } from "@/lib/languages";

export async function generateStaticParams() {
  const languages = await getLanguages();
  return languages.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <>
      <Navbar lang={lang} />
      {children}
    </>
  );
}
