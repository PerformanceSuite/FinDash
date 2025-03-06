import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './api/routes';
import path from 'path';
import https from 'https';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "cdn.jsdelivr.net"],
      },
    },
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/v1', apiRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve specific HTML files for routes
app.get('/login', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/dashboard', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/quickbooks-connect', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/quickbooks-connect.html'));
});

app.get('/quickbooks-direct', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/quickbooks-direct.html'));
});

app.get('/eula', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/eula.html'));
});

app.get('/privacy', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/privacy.html'));
});

// Catch-all route for SPA (if we add a frontend)
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// SSL options
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem')),
};

// Start HTTPS server
https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`Server running on port ${port} (HTTPS)`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at: https://localhost:${port}/api/v1`);
  console.log(`EULA: https://localhost:${port}/eula`);
  console.log(`Privacy Policy: https://localhost:${port}/privacy`);
});

export default app;
