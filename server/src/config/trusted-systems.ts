/**
 * Trusted Systems Configuration
 */

export interface TrustedSystem {
  system_name: string;
  system_key: string;
  description: string;
  enabled: boolean;
}

export const trustedSystems: Record<string, TrustedSystem> = {
  erp: {
    system_name: 'erp',
    system_key: process.env.ERP_SYSTEM_KEY || '',
    description: 'Enterprise Resource Planning System',
    enabled: true,
  },
  crm: {
    system_name: 'crm',
    system_key: process.env.CRM_SYSTEM_KEY || '',
    description: 'Customer Relationship Management System',
    enabled: true,
  },
  oa: {
    system_name: 'oa',
    system_key: process.env.OA_SYSTEM_KEY || '',
    description: 'Office Automation System',
    enabled: true,
  },
  demo: {
    system_name: 'demo',
    system_key: process.env.DEMO_SYSTEM_KEY || '',
    description: 'Demo System for Testing',
    enabled: true,
  },
  srm: {
    system_name: 'srm',
    system_key: process.env.SRM_SYSTEM_KEY || '',
    description: 'Supplier Relationship Management System',
    enabled: true,
  },
};

export function getTrustedSystem(systemName: string): TrustedSystem | null {
  const system = trustedSystems[systemName.toLowerCase()];
  return system?.enabled ? system : null;
}
