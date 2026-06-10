import { adapto } from "./adapto";

export async function getLanguages(): Promise<string[]> {
  return adapto.languages.list();
}

export async function getDefaultLanguage(): Promise<string | null> {
  const languages = await getLanguages();
  return languages[0] ?? null;
}
