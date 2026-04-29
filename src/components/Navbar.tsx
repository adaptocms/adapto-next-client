import { getLanguages } from "@/lib/languages";

export default async function Navbar({ lang }: { lang: string }) {
  const languages = await getLanguages();

  return (
    <nav className="navbar">
      <a href={`/${lang}`} className="navbar-brand">
        Adapto CMS
      </a>

      <div className="navbar-nav">
        <a href={`/${lang}/pages`}>Pages</a>
        <a href={`/${lang}/articles`}>Articles</a>
        <a href={`/${lang}/articles/categories`}>Categories</a>
        <a href={`/${lang}/collections`}>Collections</a>
        <a href={`/${lang}/micro-copies`}>Micro Copies</a>
      </div>

      <div className="navbar-lang">
        {languages.map((l) => (
          <a
            key={l}
            href={`/${l}`}
            className="lang-link"
            aria-current={l === lang ? "page" : undefined}
          >
            {l}
          </a>
        ))}
      </div>
    </nav>
  );
}
