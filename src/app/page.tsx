import { redirect } from "next/navigation";
import { getDefaultLanguage } from "@/lib/languages";
import { DEFAULT_LANGUAGE } from "@/config";

export default async function Root() {
  const lang = await getDefaultLanguage();
  redirect(`/${lang ?? DEFAULT_LANGUAGE}`);
}
