# Earthborne Rangers Fan-Made

Unofficial fan-made adventures for Earthborne Rangers: interactive campaign guides, card galleries and print-and-play downloads. Built with [Docusaurus](https://docusaurus.io/) and published on GitHub Pages.

## Working on the site

First time only, install the dependencies:

```bash
npm install
```

To preview the site on your computer, run this from the site folder and leave the terminal open:

```bash
cd ~/Scrivania/DragnCards/Earthborne_Rangers/FAN-MADE/earthborne-rangers-fan-made
npm start
```

Then open **http://localhost:3000/earthborne-rangers-fan-made/** in the browser. Changes to the guide files show up without restarting; `Ctrl+C` stops the preview.

`npm run build` makes the production build in `build/` and fails on any broken link between entries.

## Writing guide entries

The pages follow the conventions of the official guides on The Living Valley:

- Story text goes in a blockquote (`> ...`), with typographic quotes (“ ” ’).
- Card and mission names in instructions are bold capitals: `Gain the **WOUNDED BUCK** mission.`
- A choice is a `#### Rangers choose:` heading, then one `<Choice>A. ...:</Choice>` line per option, each followed by its text, and `**» Continue Reading:**` after the last one.
- Conditions are highlighted rows, one `<Option>` per row:

  ```mdx
  <Options>
  <Option>If you have collected at least 2 different Food, go to [1.04](./entry-1-04.mdx)</Option>
  <Option>Otherwise, read:</Option>
  </Options>
  ```

  A row can hold a lead line and a list (`Clear <GameIcon name="progress" />:` followed by `- ..., go to ...` items): leave a blank line after `<Option>` and before `</Option>`.
- `<Log>...</Log>` marks a campaign tracker entry; `<Objective>...</Objective>` is the closing line that says what to do next.
- `<GameIcon name="harm" />` and `<GameIcon name="progress" />` are the game symbols.
- `<GameCard adventure="<slug>" card="<id>" inline />` shows a card (add `side="back"` for the other face).

## Adding an adventure

1. Put the card images in `static/cards/<slug>/` (screen set: 750 × 1050 px, no bleed) and in `print-cards/<slug>/` (print set: 1650 × 2250 px, the card at 600 dpi plus 1/8 in bleed on every side), same file names in both. The two sets are produced with Strange Eons by the scripts in `../card-tools/`.
2. Describe the cards in `src/data/adventures.json` (front/back file and name).
3. Write the guide in `docs/<slug>/` and add it to `sidebars.js` (one `adventure(...)` line plus the list of its entries). Each entry is its own page in `docs/<slug>/missions/`, numbered 1.01, 1.02, … as in the official guides (`entry-1-01.mdx` for entry 1.01); entries a card points to carry the mission name in their title (`1.01 WOUNDED BUCK`). Link to an entry with `[1.01](./entry-1-01.mdx)`.
4. Run `npm run guides` to (re)create the guide PDF from the pages (`static/downloads/<slug>/<slug>-guide.pdf`; needs Google Chrome). Run it again whenever the guide text changes, and commit the PDF. The card ZIP and the print-and-play PDF are generated automatically by `scripts/build-downloads.mjs`.

Only publish material you own or are allowed to share: no official PDFs, card scans or artwork.
