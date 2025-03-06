import express from 'express';
import quickBooksController from '../../controllers/QuickBooksController';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/v1/quickbooks/connect/:companyId
 * @desc    Initiate QuickBooks OAuth flow
 * @access  Private
 */
router.get('/connect/:companyId', quickBooksController.connect);

/**
 * @route   GET /api/v1/quickbooks/callback
 * @desc    Handle OAuth callback from QuickBooks
 * @access  Public
 */
router.get('/callback', quickBooksController.callback);

/**
 * @route   GET /api/v1/quickbooks/success
 * @desc    Success page after successful connection
 * @access  Public
 */
router.get('/success', quickBooksController.success);

/**
 * @route   DELETE /api/v1/quickbooks/disconnect/:companyId
 * @desc    Disconnect QuickBooks
 * @access  Private
 */
router.delete('/disconnect/:companyId', authenticate, quickBooksController.disconnect);

/**
 * @route   GET /api/v1/quickbooks/status/:companyId
 * @desc    Check connection status
 * @access  Private
 */
router.get('/status/:companyId', authenticate, quickBooksController.status);

/**
 * @route   GET /api/v1/quickbooks/company-info/:companyId
 * @desc    Get company info from QuickBooks
 * @access  Private
 */
router.get('/company-info/:companyId', authenticate, quickBooksController.companyInfo);

export default router;
