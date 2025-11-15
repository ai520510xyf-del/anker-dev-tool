/**
 * title: 在表格中使用
 * description: 在表格的操作列中使用审批详情按钮，这是最常见的业务场景。每行数据都有独立的审批实例 code。
 */
import React from 'react';
import { Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ApprovalDetailButton } from 'cl-dev-tool';

interface DataType {
  key: string;
  title: string;
  applicant: string;
  status: 'pending' | 'approved' | 'rejected';
  createTime: string;
  code: string;
}

const statusConfig = {
  pending: { text: '待审批', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已驳回', color: 'red' },
};

const InTableDemo = () => {
  const columns: ColumnsType<DataType> = [
    {
      title: '申请标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status].color}>
          {statusConfig[status].text}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <ApprovalDetailButton
            code={record.code}
            systemCode="srm"
            systemKey="srm_secret_key_001"
            text="查看详情"
            buttonProps={{
              type: 'link',
              size: 'small',
            }}
          />
        </Space>
      ),
    },
  ];

  const data: DataType[] = [
    {
      key: '1',
      title: '采购申请 - 办公用品采购',
      applicant: '张三',
      status: 'pending',
      createTime: '2024-11-13 10:30:00',
      code: '447F8A25-3C7F-4B18-8F44-7242680D9477',
    },
    {
      key: '2',
      title: '报销申请 - 差旅费报销',
      applicant: '李四',
      status: 'approved',
      createTime: '2024-11-12 14:20:00',
      code: '447F8A25-3C7F-4B18-8F44-7242680D9478',
    },
    {
      key: '3',
      title: '请假申请 - 年假申请',
      applicant: '王五',
      status: 'rejected',
      createTime: '2024-11-11 09:15:00',
      code: '447F8A25-3C7F-4B18-8F44-7242680D9479',
    },
  ];

  return <Table columns={columns} dataSource={data} pagination={false} />;
};

export default InTableDemo;
