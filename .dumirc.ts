import { defineConfig } from 'dumi';
import { version } from './package.json';

export default defineConfig({
  outputPath: 'docs-dist',
  base: '/cl-dev-tool/',
  publicPath: '/cl-dev-tool/',
  favicons: [
    'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  ],
  themeConfig: {
    name: 'Anker Dev Tool',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components/approval-detail-button' },
      { title: '更新日志', link: '/changelog' },
      // {
      //   title: 'GitHub',
      //   link: 'https://github.com/anker/anker-dev-tool',
      // },
      // {
      //   title: `v${version}`,
      //   link: '/changelog',
      // },
    ],
    sidebar: {
      '/guide': [
        {
          title: '介绍',
          children: [
            { title: '快速开始', link: '/guide' },
            { title: '常见问题', link: '/guide/faq' },
          ],
        },
        {
          title: '进阶',
          children: [
            { title: '主题定制', link: '/guide/theme' },
            { title: '浏览器兼容性', link: '/guide/compatibility' },
            {
              title: '为什么后端不能使用 GitHub Pages？',
              link: '/guide/why-backend-cannot-use-github-pages',
            },
          ],
        },
      ],
      '/components': [
        {
          title: '业务组件',
          children: [
            {
              title: 'ApprovalDetailButton 审批详情按钮',
              link: '/components/approval-detail-button',
            },
          ],
        },
      ],
    },
    socialLinks: {
      github: 'https://github.com/ai520510xyf-del/cl-dev-tool',
    },
    footer: `Copyright © ${new Date().getFullYear()} | Powered by <a href="https://d.umijs.org" target="_blank">dumi</a>`,
    prefersColor: {
      default: 'light',
      switch: true,
    },
    nprogress: true,
    rtl: false,
    showLineNum: true,
    lastUpdated: true,
    search: {},
  },
  resolve: {
    entryFile: './src/index.ts',
  },
  alias: {
    '@': require('path').resolve(__dirname, 'src'),
    'cl-dev-tool': require('path').resolve(__dirname, 'src'),
  },
  lessLoader: {
    javascriptEnabled: true,
  },
  mfsu: false,
  // srcTranspiler: 'babel', // 注释掉，使用默认的 swc
  codeSplitting: false,
  styles: ['.dumi/global.less'],
  headScripts: [
    `
    (function() {
      const addHomePageClass = () => {
        const contentElement = document.querySelector('.dumi-default-content');
        const heroElement = document.querySelector('.dumi-default-hero');
        if (contentElement && heroElement) {
          contentElement.classList.add('dumi-home-content');
        } else if (contentElement) {
          contentElement.classList.remove('dumi-home-content');
        }
      };
      addHomePageClass();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addHomePageClass);
      }
      const observer = new MutationObserver(() => {
        addHomePageClass();
      });
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }
      if (window.history && window.history.pushState) {
        const originalPushState = window.history.pushState;
        window.history.pushState = function(...args) {
          originalPushState.apply(window.history, args);
          setTimeout(addHomePageClass, 200);
        };
        window.addEventListener('popstate', () => {
          setTimeout(addHomePageClass, 200);
        });
      }
      window.addEventListener('hashchange', () => {
        setTimeout(addHomePageClass, 200);
      });
      setInterval(addHomePageClass, 1000);
    })();
    `,
  ],
});
