// Generates the downloadable files from the two card sets:
//   static/cards/<slug>/      screen set (750x1050, no bleed), also shown on the site
//   print-cards/<slug>/       print set (600 dpi, 1/8 in bleed on every side)
//
// For every adventure in src/data/adventures.json:
//   static/downloads/<slug>/<slug>-cards.zip             (both sets)
//   static/downloads/<slug>/<slug>-print-and-play.pdf    (A4, duplex-ready, with bleed)
// and, for every card in src/data/resources.json, a sheet with several copies:
//   static/downloads/resources/<slug>-print-and-play.pdf
// Runs automatically before `npm start` and `npm run build`.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  PDFDocument,
  StandardFonts,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  rectangle,
  clip,
  endPath,
} from 'pdf-lib';
import JSZip from 'jszip';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (file) => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));

const MM = 72 / 25.4;
const PAGE = {w: 210 * MM, h: 297 * MM};
const CARD = {w: 63.5 * MM, h: 88.9 * MM};
const BLEED = 3.175 * MM; // bleed included in the print images
const GUTTER = 3 * MM; // space between cards; each card bleeds into half of it
const COLS = 3;
const ROWS = 3;
const MARGIN_X = (PAGE.w - COLS * CARD.w - (COLS - 1) * GUTTER) / 2;
const MARGIN_Y = (PAGE.h - ROWS * CARD.h - (ROWS - 1) * GUTTER) / 2;
const MARK = 3 * MM;
const MARK_GAP = BLEED + 0.4 * MM;

// Bottom-left corner of the trimmed card in a given cell.
const cellX = (col) => MARGIN_X + col * (CARD.w + GUTTER);
const cellY = (row) => PAGE.h - MARGIN_Y - CARD.h - row * (CARD.h + GUTTER);

function drawCutMarks(page) {
  const line = (start, end) =>
    page.drawLine({start, end, thickness: 0.4, color: rgb(0.35, 0.35, 0.35)});
  const top = cellY(0) + CARD.h;
  const bottom = cellY(ROWS - 1);
  const left = cellX(0);
  const right = cellX(COLS - 1) + CARD.w;
  for (let c = 0; c < COLS; c++) {
    for (const x of [cellX(c), cellX(c) + CARD.w]) {
      line({x, y: bottom - MARK_GAP - MARK}, {x, y: bottom - MARK_GAP});
      line({x, y: top + MARK_GAP}, {x, y: top + MARK_GAP + MARK});
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (const y of [cellY(r), cellY(r) + CARD.h]) {
      line({x: left - MARK_GAP - MARK, y}, {x: left - MARK_GAP, y});
      line({x: right + MARK_GAP, y}, {x: right + MARK_GAP + MARK, y});
    }
  }
}

async function drawSheet(pdf, font, images, label, mirrored) {
  const page = pdf.addPage([PAGE.w, PAGE.h]);
  for (const [i, image] of images.entries()) {
    if (!image) continue;
    const row = Math.floor(i / COLS);
    const col = mirrored ? COLS - 1 - (i % COLS) : i % COLS;
    const x = cellX(col);
    const y = cellY(row);
    // Full bleed on the outside of the sheet, half a gutter towards a neighbour.
    const l = col === 0 ? BLEED : GUTTER / 2;
    const r = col === COLS - 1 ? BLEED : GUTTER / 2;
    const b = row === ROWS - 1 ? BLEED : GUTTER / 2;
    const t = row === 0 ? BLEED : GUTTER / 2;
    page.pushOperators(
      pushGraphicsState(),
      rectangle(x - l, y - b, CARD.w + l + r, CARD.h + b + t),
      clip(),
      endPath(),
    );
    page.drawImage(image, {
      x: x - BLEED,
      y: y - BLEED,
      width: CARD.w + 2 * BLEED,
      height: CARD.h + 2 * BLEED,
    });
    page.pushOperators(popGraphicsState());
  }
  drawCutMarks(page);
  page.drawText(label, {x: cellX(0), y: 4 * MM, size: 7, font, color: rgb(0.35, 0.35, 0.35)});
}

// Texts of the PDFs and of the ZIP readme, per language.
const TEXT = {
  en: {
    note: 'unofficial fan-made content - print at 100% (actual size) - cut on the marks',
    fronts: 'fronts',
    backs: 'backs (duplex, flip on long edge)',
    suffix: '',
    readme: (title, author) =>
      `${title} - unofficial fan-made cards by ${author}\n\n` +
      'screen/  750 x 1050 px, no bleed: for digital play.\n' +
      'print/   1650 x 2250 px at 600 dpi: the card (63.5 x 88.9 mm) plus 1/8 in (3.175 mm)\n' +
      '         of bleed on every side, for print services.\n',
  },
  it: {
    note: 'contenuto fan-made non ufficiale - stampare al 100% (dimensione reale) - tagliare sui segni',
    fronts: 'fronti',
    backs: 'retri (fronte-retro, girare sul lato lungo)',
    suffix: '-it',
    readme: (title, author) =>
      `${title} - carte fan-made non ufficiali di ${author}\n\n` +
      'screen/  750 x 1050 px, senza abbondanza: per il gioco digitale.\n' +
      'print/   1650 x 2250 px a 600 dpi: la carta (63,5 x 88,9 mm) piu 1/8 di pollice (3,175 mm)\n' +
      '         di abbondanza su ogni lato, per le copisterie.\n',
  },
};
const NOTE = TEXT.en.note;

const adventures = await readJson('src/data/adventures.json');
for (const [slug, adventure] of Object.entries(adventures)) {
  // English always; plus every language that has its own cards (translations.<locale>.cards).
  const locales = ['en', ...Object.keys(adventure.translations ?? {}).filter((l) => adventure.translations[l].cards)];
  for (const loc of locales) await buildAdventure(slug, adventure, loc);
}

async function buildAdventure(slug, adventure, loc) {
  const t = TEXT[loc];
  const tr = adventure.translations?.[loc];
  const title = tr?.title ?? adventure.title;
  const cards = tr?.cards ?? adventure.cards;
  const sub = loc === 'en' ? '' : `${loc}/`;
  const outDir = path.join(root, 'static/downloads', slug);
  await fs.mkdir(outDir, {recursive: true});

  const zip = new JSZip();
  zip.file('README.txt', t.readme(title, adventure.author));
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${title} - print and play`);
  pdf.setAuthor(adventure.author);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  // A file used on several faces (same card front and back) is embedded once.
  const embedded = new Map();
  const embed = async (file, bytes) => {
    if (!embedded.has(file)) embedded.set(file, await pdf.embedJpg(bytes));
    return embedded.get(file);
  };

  const perSheet = COLS * ROWS;
  for (let start = 0; start < cards.length; start += perSheet) {
    const fronts = [];
    const backs = [];
    for (const card of cards.slice(start, start + perSheet)) {
      for (const [side, list] of [[card.front, fronts], [card.back, backs]]) {
        if (!side) {
          list.push(null);
          continue;
        }
        const print = await fs.readFile(path.join(root, 'print-cards', slug, sub, side.file));
        zip.file(`print/${side.file}`, print);
        zip.file(`screen/${side.file}`, await fs.readFile(path.join(root, 'static/cards', slug, sub, side.file)));
        list.push(await embed(side.file, print));
      }
    }
    await drawSheet(pdf, font, fronts, `${title} - ${t.note} - ${t.fronts}`, false);
    if (backs.some(Boolean)) {
      await drawSheet(pdf, font, backs, `${title} - ${t.note} - ${t.backs}`, true);
    }
  }

  await fs.writeFile(path.join(outDir, `${slug}-print-and-play${t.suffix}.pdf`), await pdf.save());
  await fs.writeFile(
    path.join(outDir, `${slug}-cards${t.suffix}.zip`),
    await zip.generateAsync({type: 'nodebuffer'}),
  );
  console.log(`[downloads] ${slug} (${loc}): ${cards.length} cards`);
}

const resources = await readJson('src/data/resources.json');
for (const [slug, resource] of Object.entries(resources)) {
  const outDir = path.join(root, 'static/downloads/resources');
  await fs.mkdir(outDir, {recursive: true});
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${resource.title} - print and play`);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const image = await pdf.embedJpg(
    await fs.readFile(path.join(root, 'print-cards/resources', resource.file)),
  );
  const copies = Array(resource.copies).fill(image);
  if (resource.doubleSided) {
    // Same card on both sides, so every cut piece is usable front and back.
    await drawSheet(pdf, font, copies, `${resource.title} - ${NOTE} - fronts`, false);
    await drawSheet(pdf, font, copies, `${resource.title} - ${NOTE} - backs (duplex, flip on long edge)`, true);
  } else {
    await drawSheet(pdf, font, copies, `${resource.title} - ${NOTE}`, false);
  }
  await fs.writeFile(path.join(outDir, `${slug}-print-and-play.pdf`), await pdf.save());
  console.log(`[downloads] resource ${slug}: ${resource.copies} copies`);
}
