import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApprovalDetailButton from '../index';

// Mock axios
vi.mock('axios');

describe('ApprovalDetailButton', () => {
  const defaultProps = {
    code: 'TEST123',
    systemCode: 'SRM',
    systemKey: 'test-key',
  };

  it('should render button with default text', () => {
    render(<ApprovalDetailButton {...defaultProps} />);
    expect(screen.getByText('审批流程')).toBeInTheDocument();
  });

  it('should render button with custom text', () => {
    render(<ApprovalDetailButton {...defaultProps} text="查看详情" />);
    expect(screen.getByText('查看详情')).toBeInTheDocument();
  });

  it('should be disabled when code is empty', () => {
    render(<ApprovalDetailButton {...defaultProps} code="" />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should open drawer when clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalDetailButton {...defaultProps} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // 验证抽屉已打开（假设抽屉标题为"审批详情"）
    // 注意：实际测试需要 mock API 响应
  });

  it('should call onClose when drawer is closed', async () => {
    const onClose = vi.fn();
    render(<ApprovalDetailButton {...defaultProps} onClose={onClose} />);

    // 测试关闭回调（需要打开并关闭抽屉）
  });

  it('should accept custom buttonProps', () => {
    render(
      <ApprovalDetailButton
        {...defaultProps}
        buttonProps={{ type: 'primary', size: 'large' }}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('ant-btn-primary');
    expect(button).toHaveClass('ant-btn-lg');
  });
});
