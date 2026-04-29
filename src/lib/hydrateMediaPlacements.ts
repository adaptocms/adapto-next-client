import type { IMediaObjectsPlacement } from "../types/shared";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getYouTubeEmbedUrl(url: string): string | null {
  const regExp =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = url.match(regExp);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const regExp =
    /(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:(?:[a-z0-9_-]+\/)+(?:videos?\/)?)?(\d+)(?:\/([a-z0-9]+))?/i;
  const match = url.match(regExp);
  if (!match?.[1]) return null;
  const hash = match[2];
  return hash
    ? `https://player.vimeo.com/video/${match[1]}?h=${hash}`
    : `https://player.vimeo.com/video/${match[1]}`;
}

function getTikTokEmbedUrl(url: string): string | null {
  const regExp =
    /tiktok\.com\/(?:@[a-zA-Z0-9_.-]+\/video\/|v\/|embed\/v2\/)(\d+)/i;
  const match = url.match(regExp);
  return match?.[1] ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
}

function getInstagramEmbedUrl(url: string): string | null {
  const regExp =
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/;
  const match = url.match(regExp);
  return match ? `https://www.instagram.com/p/${match[1]}/embed/captioned/` : null;
}

export function hydrateMediaPlacements(
  html: string,
  placements: IMediaObjectsPlacement[],
): string {
  for (const placement of placements ?? []) {
    const { placement_key, media_object, alt_text, caption, meta_data } =
      placement;

    if (!media_object) continue;

    const safeAlt = escapeHtml(alt_text || media_object.description || "");
    const safeCaption = escapeHtml(caption || "");

    let showAsLink = false;
    if (meta_data) {
      try {
        const parsed =
          typeof meta_data === "string" ? JSON.parse(meta_data) : meta_data;
        showAsLink = parsed?.showAsLink === true;
      } catch {}
    }

    let innerHtml = "";

    if (showAsLink) {
      innerHtml = `<a href="${media_object.url}" target="_blank" rel="noopener noreferrer" title="${safeAlt}">${media_object.url}</a>`;
    } else {
      switch (media_object.type) {
        case "image":
          innerHtml = `<img src="${media_object.url}?w=1216&format=webp&quality=80" alt="${safeAlt}" width="1216" height="640" loading="lazy" style="width:100%;max-width:800px;height:auto;border-radius:16px;object-fit:cover;" />`;
          break;

        case "youtube": {
          const embed = getYouTubeEmbedUrl(media_object.url);
          if (embed)
            innerHtml = `<div style="width:100%;max-width:800px;aspect-ratio:16/9;border-radius:16px;overflow:hidden;"><iframe src="${embed}" title="${safeAlt || "YouTube"}" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy" style="width:100%;height:100%;"></iframe></div>`;
          break;
        }

        case "vimeo": {
          const embed = getVimeoEmbedUrl(media_object.url);
          if (embed)
            innerHtml = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;"><iframe src="${embed}" title="${safeAlt || "Vimeo"}" frameborder="0" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen loading="lazy" style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>`;
          break;
        }

        case "tiktok": {
          const embed = getTikTokEmbedUrl(media_object.url);
          if (embed)
            innerHtml = `<div style="max-width:400px;border-radius:16px;overflow:hidden;"><iframe src="${embed}" title="${safeAlt || "TikTok"}" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy" style="width:100%;height:715px;display:block;"></iframe></div>`;
          break;
        }

        case "instagram_post":
        case "instagram_reel": {
          const embed = getInstagramEmbedUrl(media_object.url);
          if (embed) {
            const h = media_object.type === "instagram_reel" ? "750px" : "600px";
            innerHtml = `<div style="max-width:400px;border-radius:16px;overflow:hidden;"><iframe src="${embed}" title="${safeAlt || "Instagram"}" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy" style="width:100%;height:${h};display:block;"></iframe></div>`;
          }
          break;
        }

        case "video":
          innerHtml = `<video controls preload="metadata" style="width:100%;max-width:800px;border-radius:16px;"><source src="${media_object.url}"></video>`;
          break;

        case "audio":
          innerHtml = `<audio controls preload="metadata" style="width:100%;max-width:800px;"><source src="${media_object.url}"></audio>`;
          break;

        case "document":
          innerHtml = `<div style="width:100%;max-width:800px;border:1px solid #e5e7eb;border-radius:16px;padding:24px;display:flex;align-items:center;gap:16px;"><span style="flex:1;font-weight:600;">${media_object.title}</span><a href="${media_object.url}" target="_blank" rel="noopener noreferrer" style="padding:8px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">Download</a></div>`;
          break;

        default:
          innerHtml = `<div style="width:100%;max-width:800px;border:1px solid #e5e7eb;border-radius:16px;padding:24px;text-align:center;"><h3>${media_object.title}</h3><a href="${media_object.url}" target="_blank" rel="noopener noreferrer">View Media</a></div>`;
      }
    }

    if (!innerHtml) continue;

    const replacement = showAsLink
      ? innerHtml
      : `<figure style="margin:24px 0;">${innerHtml}${safeCaption ? `<figcaption style="font-size:14px;color:#4b5563;margin-top:8px;">${safeCaption}</figcaption>` : ""}</figure>`;

    const escaped = placement_key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(
      new RegExp(`<media-object[^>]*key=['"]${escaped}['"][^>]*>\\s*<\\/media-object>`, "g"),
      replacement,
    );
  }

  return html;
}
