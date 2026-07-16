import Navbar from "@/components/Navbar";
import { getLanguages } from "@/lib/languages";
import { DEFAULT_LANGUAGE } from "@/config";

export async function generateStaticParams() {
  const languages = await getLanguages();
  // Unconfigured/empty tenant → still build the default-language route so the redirect
  // target exists and onboarding renders instead of a 404.
  const langs = languages.length ? languages : [DEFAULT_LANGUAGE];
  return langs.map((lang) => ({ lang }));
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
