import { adapto } from "./adapto";
import { guardedAll } from "./loaders";

export async function getLanguages(): Promise<string[]> {
  return guardedAll(() => adapto.languages.list());
}

export async function getDefaultLanguage(): Promise<string | null> {
  const languages = await getLanguages();
  return languages[0] ?? null;
}
