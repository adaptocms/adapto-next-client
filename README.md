# 🚀 Adapto Next.js Client

A multi-language, statically generated Next.js client for [Adapto CMS](https://adaptocms.com). All pages are pre-rendered at build time from your CMS content — articles, custom collections, pages, categories, and micro-copies — with full pagination and language support.

---

## 📂 Project Structure

```text
/
├── src/
│   ├── app/
│   │   └── [lang]/                   # Language prefix (e.g. /en-US, /ro-RO)
│   │       ├── articles/             # [RESERVED] Article system
│   │       │   ├── page.tsx
│   │       │   ├── [slug]/page.tsx
│   │       │   ├── page/[pageNum]/page.tsx
│   │       │   └── categories/       # Article categories
│   │       ├── collections/          # Collections index
│   │       ├── [collection_slug]/    # [DYNAMIC] All custom collections
│   │       │   ├── page.tsx
│   │       │   ├── [item_slug]/page.tsx
│   │       │   └── page/[pageNum]/page.tsx
│   │       ├── pages/                # CMS pages
│   │       └── micro-copies/         # i18n strings
│   ├── components/                   # Navbar, Pagination
│   ├── lib/                          # Adapto SDK, media hydration
│   └── types/                        # TypeScript interfaces
```

---

## ⚙️ Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure your Adapto tenant**

```bash
cp .env.example .env
```

Open `.env` and add your credentials:

```env
ADAPTO_API_URL=https://public-api.adaptocms.com
ADAPTO_API_KEY=your_api_key_here
```

Your API key is available in the Adapto backoffice under **Settings → API Keys**. The tenant ID is derived automatically from the key — no separate variable needed.

**3. Run**

```bash
npm run dev      # development server at http://localhost:1234
npm run build    # fetch all content and pre-render every page
npm run start    # serve the production build
```

---

## 🧞 Commands

| Command | Action |
|---|---|
| `npm run dev` | Start development server at `http://localhost:1234` |
| `npm run build` | Fetch all CMS content and pre-render the full static site |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |

---

## ✅ Verification gate

Run these before merging any change to the scaffold. A fresh scaffold must survive with no
API key, because `create-adapto-app` generates a project that gets built before anyone
configures it.

1. **Keyless build** — with no `.env`, `npm run build` succeeds and pre-renders the
   default-language routes. Unconfigured content loads as empty and onboarding renders,
   nothing crashes.
2. **Keyless dev** — `npm run dev` serves `/` with a 200 and no crash.
3. **Broken build fails loud** — with a set-but-invalid key, `npm run build` exits non-zero.
   A configured build that can't reach the CMS must fail, not ship an empty site silently.
4. **Valid key** — with a real `.env`, `npm run build` authenticates, fetches content, and
   pre-renders every language.

The guard lives in `src/lib/loaders.ts` (`IS_CONFIGURED` plus `guardedList` / `guardedAll`):
every SDK call routes through it, so an unconfigured project degrades to empty data instead of
throwing, while a real fetch error in a production build still throws.

---

## 🗂️ Content Types

### Articles

The article system lives at `/[lang]/articles/`. Each article maps to a slug from your Adapto tenant. Categories are first-class — each category gets its own listing page at `/[lang]/articles/categories/[slug]` showing all articles tagged with it.

Articles support rich content with embedded media (images, YouTube, Vimeo, TikTok, video, audio, documents) via placement keys in the HTML.

### Custom Collections

Any collection you create in Adapto is automatically routed at `/[lang]/[collection_slug]/`. Item detail pages are at `/[lang]/[collection_slug]/[item_slug]`. No configuration needed — create a collection in the CMS and it immediately gets a listing and detail route.

Collection items render all fields defined in the collection schema. Field types like `rich_text` get hydrated media support; `url` and `email` fields render as links; everything else renders as plain text.

If you need a bespoke UI for a specific collection, create a static route in `src/app/[lang]/` named after the collection's slug. Next.js static routes take priority over the dynamic `[collection_slug]` catch-all.

### Pages

CMS pages live at `/[lang]/pages/[slug]`. They support the same rich media embedding as articles.

### Micro-copies

Micro-copies are key/value pairs used for UI strings and translations. They are listed at `/[lang]/micro-copies/` and can also be consumed programmatically via `adapto.microCopy.getDictionary(language)` to get a `Record<string, string>` map.

---

## 🌍 Localization

Languages are fetched automatically from your Adapto tenant at build time. Every route is generated once per configured language.

- `/en-US/articles/my-post`
- `/ro-RO/articles/my-post`

The default language is the first one returned by the Adapto API. The root `/` redirects to it automatically. The Navbar renders a language switcher with all available languages.

---

## 🛣️ Routing Priority

Next.js resolves routes in this order:

1. **Static segments** — explicitly named folders like `articles/`, `collections/`, `pages/`, `micro-copies/` always win.
2. **Dynamic segments** — `[collection_slug]` catches everything else.

This means collections named `articles`, `pages`, `collections`, or `micro-copies` in your Adapto tenant would conflict with the reserved routes above. Use different slugs for those collections.

---

## 🔑 API Key Format

Adapto API keys follow the format `prefix.TENANT_ID.suffix`. This client extracts the tenant ID automatically — you only need to set `ADAPTO_API_KEY` in your `.env`.
