// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'apimda',
  tagline: 'Create declarative serverless APIs with AWS API Gateway and Lambda',
  url: 'https://apimda.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'apimda', // Usually your GitHub org/user name.
  projectName: 'apimda', // Usually your repo name.
  trailingSlash: false,

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/joemays/apimda/tree/main/docs'
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'apimda',
          src: 'img/logo.svg',
          srcDark: 'img/logo-dark.svg'
        },
        items: [
          {
            type: 'doc',
            docId: 'introduction/index',
            position: 'right',
            label: 'Documentation'
          },
          {
            href: 'https://github.com/joemays/apimda',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Introduction',
                to: '/docs/introduction'
              },
              {
                label: 'Quick Start',
                to: '/docs/introduction/quick-start'
              },
              {
                label: 'Controller Reference',
                to: '/docs/controllers'
              },
              {
                label: 'Deployment Reference',
                to: '/docs/deployment'
              }
            ]
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Contributions',
                to: '/docs/contributions'
              },
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/joemays/apimda/discussions'
              }
              // {
              //   label: "Twitter",
              //   href: "https://twitter.com/username",
              // },
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/joemays/apimda'
              },
              {
                label: 'Issues',
                href: 'https://github.com/joemays/apimda/issues'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Joseph Mays`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false
        }
      }
    })
};

module.exports = config;
