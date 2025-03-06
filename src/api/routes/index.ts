import express from 'express';
import authRoutes from './auth';
import quickbooksRoutes from './quickbooks';

const router = express.Router();

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/quickbooks', quickbooksRoutes);
// Add more routes here as they are created
// router.use('/users', userRoutes);
// router.use('/companies', companyRoutes);
// router.use('/accounts', accountRoutes);
// router.use('/transactions', transactionRoutes);
// router.use('/invoices', invoiceRoutes);
// router.use('/bills', billRoutes);

export default router;
