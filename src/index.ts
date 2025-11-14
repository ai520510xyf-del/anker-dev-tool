// 自动导入样式（用户无需手动导入）
import './styles/index.less';

// 导出所有组件
export { default as ApprovalDetailButton } from './components/ApprovalDetailButton';
export type { ApprovalDetailButtonProps } from './components/ApprovalDetailButton';

// 导出类型
export * from './types';

// 导出工具函数（如果有）
export * from './utils';
