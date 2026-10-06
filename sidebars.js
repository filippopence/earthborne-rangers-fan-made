// @ts-check

// As in the official guides, mission entries are numbered 1.01, 1.02, ... and listed
// flat under "1. Missions" (docs/<slug>/missions/entry-1-NN.mdx); further numbered
// sections (characters, locations) follow at the same level.
const missions = (slug, count) =>
  Array.from({length: count}, (_, i) => `${slug}/missions/entry-1-${String(i + 1).padStart(2, '0')}`);

function adventure(slug, label, missionCount, sections = []) {
  return {
    type: 'category',
    label,
    link: {type: 'doc', id: `${slug}/index`},
    items: [
      {
        type: 'category',
        label: '1. Missions',
        link: {type: 'doc', id: `${slug}/missions/index`},
        items: missions(slug, missionCount),
      },
      ...sections,
      `${slug}/end-of-the-day`,
      `${slug}/cards`,
      `${slug}/download`,
      `${slug}/acknowledgements`,
    ],
  };
}

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  guides: [
    adventure('peril-in-ancestors-grove', "Peril in Ancestor's Grove", 11),
    adventure('missing-supplies', 'Missing Supplies', 41, [
      'missing-supplies/kordo-ranger-veteran',
      'missing-supplies/spirit-speaker-nal',
      'missing-supplies/hy-pimpot-chef',
      'missing-supplies/calypsa-ranger-mentor',
      'missing-supplies/ben-amon-swift-pilot',
      'missing-supplies/lunn-outpost-tender',
    ]),
    'resources',
    'about',
  ],
};

export default sidebars;
