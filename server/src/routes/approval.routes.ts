/**
 * Approval Routes
 */

import { Router } from 'express';
import { approvalController } from '../controllers/approval.controller';
import { systemAuthMiddleware } from '../middleware/auth.middleware';
import { validateInstanceId } from '../middleware/validation.middleware';

const router = Router();

/**
 * GET /api/approval/:instanceId
 * Fetch approval instance timeline data
 *
 * Headers:
 *   x-system-name: System identifier (e.g., 'erp', 'crm')
 *   x-system-key: System authentication key
 *
 * Params:
 *   instanceId: Feishu approval instance code
 *
 * Response:
 *   200: Success with processed approval data
 *   400: Invalid instance ID
 *   401: Missing authentication headers
 *   403: Invalid system credentials
 *   500: Server error
 */
router.get(
  '/:instanceId',
  systemAuthMiddleware,
  validateInstanceId,
  (req, res) => approvalController.getApprovalData(req, res)
);

export default router;
