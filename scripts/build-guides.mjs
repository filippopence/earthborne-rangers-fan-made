// Builds a printable campaign guide PDF for every adventure from the built site,
// so the PDF always matches the pages and the cards:
//   static/downloads/<slug>/<slug>-guide.pdf      (A4 landscape, two columns)
//   static/downloads/<slug>/<slug>-guide-it.pdf   (same, in Italian, for adventures with an Italian translation)
// Run with `npm run guides` (builds the site first; needs Google Chrome or Chromium).
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = '/earthborne-rangers-fan-made';
const STATIC = pathToFileURL(path.join(root, 'static')).href;
const adventures = JSON.parse(await fs.readFile(path.join(root, 'src/data/adventures.json'), 'utf8'));
const sidebars = (await import(pathToFileURL(path.join(root, 'sidebars.js')).href)).default;

const chrome = ['google-chrome', 'chromium', 'chromium-browser'].find((bin) => {
  try {
    execFileSync(bin, ['--version'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
});
if (!chrome) throw new Error('Google Chrome or Chromium is needed to print the guides');

// Doc ids of an adventure in reading order, without the site-only pages.
function docIds(item) {
  if (typeof item === 'string') return [item];
  return [item.link?.id, ...item.items.flatMap(docIds)].filter(Boolean);
}

const anchor = (id) => id.replace(/\/index$/, '').split('/').slice(1).join('-') || 'top';

async function section(id, loc) {
  const prefix = loc === 'en' ? BASE : `${BASE}/${loc}`;
  const file = path.join(root, loc === 'en' ? 'build' : `build/${loc}`, 'docs', id.replace(/\/index$/, '') + '.html');
  const page = await fs.readFile(file, 'utf8');
  const start = page.indexOf('<div class="theme-doc-markdown markdown">');
  let html = page.slice(start, page.indexOf('</article>', start));
  html = html
    .replace(/<a [^>]*class="hash-link"[^>]*>.*?<\/a>/g, '')
    .replace(/ loading="lazy"/g, '')
    // the built HTML is minified, so attribute values may be unquoted
    .replace(new RegExp(`src="?${prefix}/([^" >]+)"?`, 'g'), (_, file) => `src="${STATIC}/${file}"`)
    // links between entries become links inside the PDF
    .replace(new RegExp(`href="?${prefix}/docs/([^" >#]+)(#[^" >]*)?"?`, 'g'), (_, doc) => `href="#${anchor(doc)}"`);
  return `<section id="${anchor(id)}">${html}</section>`;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300..700;1,300..700&display=swap');
@page { size: A4 landscape; margin: 14mm 12mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Josefin Sans', sans-serif; font-size: 10.5pt; line-height: 1.4; color: #1e4131;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
main { column-count: 2; column-gap: 12mm; }
section { margin-bottom: 5mm; }
p, ul { margin: 0 0 2.4mm; }
ul { padding-left: 5mm; }
a { color: inherit; }
h1 { font-size: 15pt; margin: 0 0 2.5mm; break-after: avoid; }
.cover h1 { font-size: 26pt; margin-bottom: 1mm; }
h2 { font-size: 13pt; margin: 4mm 0 2mm; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 3mm 0 2mm; break-after: avoid; }
h4, h5 { font-size: 10.5pt; margin: 3mm 0 2.4mm; text-align: center; text-transform: uppercase; color: #0b281d; break-after: avoid; }
h4 { padding: 2mm 0 1mm; background: #ffcf8f; }
h5 { padding: 2mm 2mm 1mm; background: #dbe5ff; }
blockquote { margin: 0 0 2.4mm; padding: 3mm 4mm 0.6mm; border: 0.3mm solid #ffbd64; border-right: none; background: #fafae240; }
.guide-options { margin-bottom: 2.4mm; break-inside: avoid; }
.guide-option { padding: 2mm 3mm 1.2mm; font-weight: 700; text-transform: uppercase; }
.guide-option:nth-child(odd) { background: #d1e4ff; }
.guide-option p, .guide-option ul { margin-bottom: 0; }
.guide-option svg[aria-label='harm'] { color: #c00b0b; }
.guide-choice { color: #c00b0b; font-weight: 700; break-after: avoid; }
.guide-log { color: #6282c1; font-weight: 700; text-transform: uppercase; }
blockquote > .guide-log { display: block; margin-bottom: 2.4mm; }
.guide-objective { color: #6282c1; font-weight: 700; font-style: italic; }
.theme-admonition, .cover-skip { display: none; }
button { display: block; margin: 0 0 2.4mm; padding: 0; border: 0; background: none; font: inherit; color: inherit; break-inside: avoid; }
button img { display: block; width: 36mm; border-radius: 1.6mm; }
button span { display: block; width: 36mm; margin-top: 0.8mm; font-size: 7.5pt; text-align: center; }
footer { margin-top: 6mm; font-size: 8pt; opacity: 0.75; column-span: all; }
`;

const FOOTER = {
  en: `Unofficial fan-made content, not affiliated with, endorsed or sponsored by Earthborne Games.
Earthborne Rangers and all related names, artwork and icons are property of Earthborne Games.`,
  it: `Contenuti fan-made non ufficiali, non affiliati, approvati o sponsorizzati da Earthborne Games.
Earthborne Rangers e tutti i nomi, le illustrazioni e le icone correlati sono proprietà di Earthborne Games.`,
};

for (const item of sidebars.guides) {
  const slug = item.link?.id?.split('/')[0];
  if (!adventures[slug]) continue;
  const ids = docIds(item).filter((id) => !/\/(cards|download)$/.test(id));
  // English always; plus every language that has its own cards, so its pages are fully translated.
  const locales = ['en', ...Object.keys(adventures[slug].translations ?? {}).filter((l) => adventures[slug].translations[l].cards)];
  for (const loc of locales) {
    const title = adventures[slug].translations?.[loc]?.title ?? adventures[slug].title;
    const sections = await Promise.all(ids.map((id) => section(id, loc)));
    sections[0] = sections[0].replace('<section', '<section class="cover"');
    const html = `<!doctype html><html lang="${loc}"><head><meta charset="utf-8"><title>${title}</title>
<style>${CSS}</style></head><body><main>${sections.join('\n')}
<footer>${FOOTER[loc]}</footer></main></body></html>`;
    const tmp = path.join(os.tmpdir(), `${slug}-guide-${loc}.html`);
    await fs.writeFile(tmp, html);
    const out = path.join(root, 'static/downloads', slug, `${slug}-guide${loc === 'en' ? '' : `-${loc}`}.pdf`);
    execFileSync(
      chrome,
      ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', '--virtual-time-budget=8000',
        `--print-to-pdf=${out}`, pathToFileURL(tmp).href],
      {stdio: 'ignore'},
    );
    console.log(`[guides] ${slug} (${loc}): ${ids.length} sections -> ${path.relative(root, out)}`);
  }
}
