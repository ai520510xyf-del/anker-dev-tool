/**
 * Configuration Index
 * Loads environment variables
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  feishu: {
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
    baseUrl: process.env.FEISHU_BASE_URL || 'https://open.feishu.cn',
    tokenEndpoint: '/open-apis/auth/v3/tenant_access_token/internal',
    approvalEndpoint: '/open-apis/approval/v4/instances',
    timeout: 5000,
    tokenTTL: 6900, // 7200 - 300 (提前5分钟过期)
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  trustedSystems: {
    erp: process.env.ERP_SYSTEM_KEY || '',
    crm: process.env.CRM_SYSTEM_KEY || '',
    oa: process.env.OA_SYSTEM_KEY || '',
    demo: process.env.DEMO_SYSTEM_KEY || '',
  },
};
