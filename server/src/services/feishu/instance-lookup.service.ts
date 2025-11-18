/**
 * Feishu Instance Lookup Service
 * Find instance code by approval serial number
 *
 * Note: Due to Feishu API limitations, the instance list API requires approval_code parameter.
 * This service provides alternative approaches to find instances by serial number.
 */

import axios, { AxiosError } from 'axios';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { getTenantToken, clearTokenCache } from './token.service';
import { getApprovalInstance } from './approval.service';

export interface ApprovalInstanceItem {
  instance_code: string;
  serial_number: string;
  approval_name: string;
  approval_code: string;
  status: string;
  create_time: string;
  end_time?: string;
  initiator_user_id: string;
  initiator_open_id: string;
}

export interface InstanceLookupResponse {
  code: number;
  msg: string;
  data: {
    instance_list: ApprovalInstanceItem[];
    page_token?: string;
    has_more: boolean;
  };
}

/**
 * Find instance code by serial number using multiple strategies
 */
export async function findInstanceBySerialNumber(
  serialNumber: string,
  approvalCode?: string,
  retries: number = 3
): Promise<string | null> {
  logger.info(`Starting lookup for serial number: ${serialNumber}`, {
    approvalCode: approvalCode || 'not provided',
  });

  // Strategy 1: If approval_code is provided, search within that specific approval definition
  if (approvalCode) {
    logger.info(
      `Strategy 1: Searching within approval definition: ${approvalCode}`
    );
    const result = await searchInApprovalDefinition(
      serialNumber,
      approvalCode,
      retries
    );
    if (result) {
      return result;
    }
  }

  // Strategy 2: Try common instance code patterns based on serial number
  logger.info(`Strategy 2: Trying common instance code patterns`);
  const patternResult = await tryCommonInstancePatterns(serialNumber, retries);
  if (patternResult) {
    return patternResult;
  }

  // Strategy 3: If we have known approval codes, try searching in each
  logger.info(`Strategy 3: Searching in known approval definitions`);
  const knownCodesResult = await searchInKnownApprovalCodes(
    serialNumber,
    retries
  );
  if (knownCodesResult) {
    return knownCodesResult;
  }

  logger.warn(`All strategies failed for serial number: ${serialNumber}`);
  return null;
}

/**
 * Search within a specific approval definition
 */
async function searchInApprovalDefinition(
  serialNumber: string,
  approvalCode: string,
  retries: number = 3
): Promise<string | null> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const token = await getTenantToken();

      // Calculate time range (search last 60 days)
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - 60 * 24 * 60 * 60;

      logger.debug(
        `Searching in approval ${approvalCode} from ${new Date(startTime * 1000).toISOString()} to ${new Date(endTime * 1000).toISOString()}`
      );

      const response = await axios.get<InstanceLookupResponse>(
        `${config.feishu.baseUrl}/open-apis/approval/v4/instances`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          params: {
            approval_code: approvalCode,
            start_time: startTime,
            end_time: endTime,
            page_size: 100,
            locale: 'zh-CN',
          },
          timeout: config.feishu.timeout,
        }
      );

      if (response.data.code === 99991663) {
        logger.warn('Token expired, clearing cache and retrying');
        await clearTokenCache();
        attempt++;
        continue;
      }

      if (response.data.code !== 0) {
        logger.error(`Failed to query approval ${approvalCode}:`, {
          code: response.data.code,
          msg: response.data.msg,
        });
        throw new Error(
          `查询审批定义 ${approvalCode} 失败: ${response.data.msg}`
        );
      }

      const instances = response.data.data.instance_list || [];
      logger.debug(
        `Found ${instances.length} instances in approval ${approvalCode}`
      );

      // Search through all pages if necessary
      const allInstances = [...instances];
      let pageToken = response.data.data.page_token;
      let pageCount = 1;

      while (pageToken && response.data.data.has_more && pageCount < 10) {
        const nextPageResponse = await axios.get<InstanceLookupResponse>(
          `${config.feishu.baseUrl}/open-apis/approval/v4/instances`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            params: {
              approval_code: approvalCode,
              start_time: startTime,
              end_time: endTime,
              page_size: 100,
              page_token: pageToken,
              locale: 'zh-CN',
            },
            timeout: config.feishu.timeout,
          }
        );

        if (nextPageResponse.data.code === 0) {
          const nextInstances = nextPageResponse.data.data.instance_list || [];
          allInstances.push(...nextInstances);
          pageToken = nextPageResponse.data.data.page_token;
          pageCount++;
          logger.debug(
            `Added ${nextInstances.length} instances from page ${pageCount}`
          );
        } else {
          break;
        }
      }

      // Find matching instance by serial number
      const matchingInstance = allInstances.find(
        instance => instance.serial_number === serialNumber
      );

      if (matchingInstance) {
        logger.info(
          `✓ Found instance ${matchingInstance.instance_code} for serial ${serialNumber} in approval ${approvalCode}`
        );
        return matchingInstance.instance_code;
      }

      logger.debug(
        `Serial number ${serialNumber} not found in approval ${approvalCode} (${allInstances.length} instances checked)`
      );
      return null;
    } catch (error) {
      attempt++;
      if (error instanceof AxiosError && error.response) {
        logger.error(`API error for approval ${approvalCode}:`, {
          status: error.response.status,
          data: error.response.data,
        });
      }

      if (attempt >= retries) {
        logger.error(`Max retries reached for approval ${approvalCode}`, error);
        throw error;
      }

      const delay = 1000 * attempt;
      logger.warn(`Retrying in ${delay}ms (attempt ${attempt}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return null;
}

/**
 * Try common instance code patterns based on serial number
 */
async function tryCommonInstancePatterns(
  serialNumber: string,
  retries: number = 3
): Promise<string | null> {
  const patterns = generateInstanceCodePatterns(serialNumber);

  logger.debug(
    `Trying ${patterns.length} instance code patterns:`,
    patterns.slice(0, 5)
  );

  for (const pattern of patterns) {
    try {
      logger.debug(`Testing instance code pattern: ${pattern}`);

      // Try to fetch the instance directly
      const response = await getApprovalInstance(pattern);

      if (response && response.code === 0) {
        logger.info(`✓ Found valid instance using pattern: ${pattern}`);
        return pattern;
      }
    } catch (error) {
      // Instance doesn't exist with this pattern, continue to next
      logger.debug(
        `Pattern ${pattern} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  logger.debug(`No valid patterns found for serial number: ${serialNumber}`);
  return null;
}

/**
 * Generate possible instance code patterns based on serial number
 */
function generateInstanceCodePatterns(serialNumber: string): string[] {
  const patterns: string[] = [];

  // Common prefixes seen in Feishu instance codes
  const prefixes = [
    '', // Direct serial number
    'INST_',
    'APP_',
    'WF_',
    'FLOW_',
    serialNumber.substring(0, 4) + '_', // First 4 digits as prefix
  ];

  // Common suffixes
  const suffixes = [
    '', // Direct serial number
    '_INST',
    '_APP',
    '_WF',
  ];

  // Generate combinations
  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      const pattern = `${prefix}${serialNumber}${suffix}`;
      if (pattern !== serialNumber || patterns.length === 0) {
        patterns.push(pattern);
      }
    }
  }

  // Add some date-based patterns if serial number looks like a date
  if (/^\d{8,}/.test(serialNumber)) {
    const dateStr = serialNumber.substring(0, 8); // YYYYMMDD
    patterns.push(`${dateStr}_${serialNumber.substring(8)}`);
    patterns.push(`WF_${dateStr}_${serialNumber.substring(8)}`);
  }

  // Remove duplicates and limit to reasonable number
  return [...new Set(patterns)].slice(0, 20);
}

/**
 * Search in known approval codes (if any are configured)
 */
async function searchInKnownApprovalCodes(
  serialNumber: string,
  retries: number = 3
): Promise<string | null> {
  // Common approval codes that might be used in the system
  // You can customize this list based on your organization's approval processes
  const knownApprovalCodes: string[] = [
    // Add your known approval codes here
    // 'SUPPLIER_REVIEW',
    // 'PURCHASE_REQUEST',
    // 'EXPENSE_CLAIM',
    // 'LEAVE_REQUEST',
  ];

  if (knownApprovalCodes.length === 0) {
    logger.debug('No known approval codes configured for batch search');
    return null;
  }

  logger.info(`Searching in ${knownApprovalCodes.length} known approval codes`);

  for (const approvalCode of knownApprovalCodes) {
    try {
      const result = await searchInApprovalDefinition(
        serialNumber,
        approvalCode,
        retries
      );
      if (result) {
        logger.info(`✓ Found instance in approval code: ${approvalCode}`);
        return result;
      }
    } catch (error) {
      logger.debug(
        `Search failed in approval ${approvalCode}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      // Continue to next approval code
    }
  }

  logger.debug('Serial number not found in any known approval codes');
  return null;
}

/**
 * Get multiple instances by serial numbers
 */
export async function findMultipleInstancesBySerialNumbers(
  serialNumbers: string[],
  approvalCode?: string
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  // Process with limited concurrency to avoid overwhelming the API
  const concurrencyLimit = 2;
  const chunks = [];

  for (let i = 0; i < serialNumbers.length; i += concurrencyLimit) {
    chunks.push(serialNumbers.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async serialNumber => {
      try {
        const instanceCode = await findInstanceBySerialNumber(
          serialNumber,
          approvalCode
        );
        results[serialNumber] = instanceCode;
      } catch (error) {
        logger.error(`Failed to lookup serial number ${serialNumber}:`, error);
        results[serialNumber] = null;
      }
    });

    await Promise.all(promises);
  }

  return results;
}
