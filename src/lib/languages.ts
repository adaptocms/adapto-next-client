import { adapto } from "./adapto-sdk";
import { TENANT_ID } from "../config";

export async function getLanguages(): Promise<string[]> {
  return adapto.languages.list(TENANT_ID);
}

export async function getDefaultLanguage(): Promise<string | null> {
  const languages = await getLanguages();
  return languages[0] ?? null;
}
