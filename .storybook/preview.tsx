import React from 'react';
import type { Preview } from '@storybook/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'padded',
  },
  decorators: [
    Story => (
      <ConfigProvider locale={zhCN}>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
};

export default preview;
