// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Earthborne Rangers Fan-Made',
  tagline: 'Unofficial fan-made adventures for Earthborne Rangers, by Filippo "Pence"',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://filippopence.github.io',
  baseUrl: '/earthborne-rangers-fan-made/',

  organizationName: 'filippopence',
  projectName: 'earthborne-rangers-fan-made',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en'},
      it: {label: 'Italiano', htmlLang: 'it'},
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Earthborne Rangers Fan-Made',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'guides',
            position: 'left',
            label: 'Campaign Guides',
          },
          {to: '/docs/resources', label: 'Resources', position: 'left'},
          {to: '/docs/about', label: 'About', position: 'left'},
          {type: 'localeDropdown', position: 'right'},
          {
            href: 'https://github.com/filippopence/earthborne-rangers-fan-made',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright:
          'Unofficial fan-made content. Not affiliated with, endorsed or sponsored by Earthborne Games. ' +
          'Earthborne Rangers and all related names, artwork and icons are property of Earthborne Games.',
      },
    }),
};

export default config;
