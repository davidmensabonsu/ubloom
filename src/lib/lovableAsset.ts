// Lovable stores large binaries on its CDN and commits only *.asset.json
// pointers whose `url` is relative (/__l5e/...). Those relative URLs resolve
// against capacitor://localhost inside the native app and 404 — they only
// work when the site is served by Lovable itself. Anchor them to the
// published web origin so the native app loads the same CDN files.
const LOVABLE_ORIGIN = 'https://ubloom.lovable.app';

export function lovableAssetUrl(url: string): string {
  return url.startsWith('/') ? `${LOVABLE_ORIGIN}${url}` : url;
}
