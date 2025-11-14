import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';

  return {
    plugins: [
      react(),
      ...(isLib
        ? [
            dts({
              insertTypesEntry: true,
              include: ['src/**/*'],
              exclude: ['src/demo/**/*'],
            }),
          ]
        : []),
    ],
    ...(isLib && {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'AnkerDevTool',
          formats: ['es', 'cjs'],
          fileName: format => `index.${format === 'es' ? 'esm' : format}.js`,
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'antd',
            '@ant-design/icons',
            'axios',
          ],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              antd: 'antd',
              '@ant-design/icons': 'icons',
              axios: 'axios',
            },
          },
        },
      },
    }),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
  };
});
