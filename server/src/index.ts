import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import fs from 'fs';

import connectDB from './config/db.config';
import firebaseApp from './config/firebase.config';

import { apiErrorMiddleware } from './utils/ApiError';
import winston from 'winston';
import gatewayRouter from './routes/gateway.routes';

// Firebase initialized via import (Auth only — no Firestore needed)


const app: Application = express();

const PORT = process.env.PORT || 8000;

// Connect to database
connectDB();

// CORS configuration
const allowedOrigins = [
  'https://2-m-technology-git-main-john7ljs-projects.vercel.app',
  'https://2-m-technology-i0q9elm6m-john7ljs-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://192.168.0.11:5173',
  'http://192.168.0.11:5174',
  'http://192.168.0.11:5175',
  'http://192.168.0.11:5176',
  'http://192.168.0.247:5174',
  'http://192.168.0.247:5175',
  'http://192.168.0.247:5176',
  'https://blurz17admin.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

const corsOptions = {
  credentials: true,
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    const isDevelopment = process.env.NODE_ENV === 'development';

    // Allow localhost and 127.0.0.1 always (dev/test)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow the specific production and preview origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments for this project only
    if (origin.includes('vercel.app') && origin.includes('2-m')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cookie',
    'Set-Cookie',
    'Access-Control-Allow-Credentials',
  ],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Only use morgan in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(compression());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/',
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1', gatewayRouter);

// 404 for unknown API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Handle root route and static files
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../../../client/dist');
  const adminPath = path.join(__dirname, '../../../admin/dist');

  const clientExists = fs.existsSync(clientPath) && fs.existsSync(path.join(clientPath, 'index.html'));
  const adminExists = fs.existsSync(adminPath) && fs.existsSync(path.join(adminPath, 'index.html'));

  if (clientExists || adminExists) {
    if (clientExists) app.use(express.static(clientPath));
    if (adminExists) app.use(express.static(adminPath));

    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
      }

      // Serve admin app for /admin routes
      if (req.path.startsWith('/admin') && adminExists) {
        return res.sendFile(path.join(adminPath, 'index.html'));
      }

      // Default to client app
      if (clientExists) {
        return res.sendFile(path.join(clientPath, 'index.html'));
      }

      res.status(404).json({ success: false, message: 'Resource not found' });
    });
  } else {
    app.get('/', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'API is running 🚀',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    });

    app.get('*', (req: Request, res: Response) => {
      if (!req.path.startsWith('/api/')) {
        res.status(404).json({
          success: false,
          message: 'This is an API-only deployment.',
        });
      }
    });
  }
} else {
  app.get('/', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'API is running 🚀 [Development]',
      timestamp: new Date().toISOString(),
    });
  });
}

// Error handling middleware — ApiError handler first, then generic catch-all
app.use(apiErrorMiddleware);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  winston.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

// Export for Vercel
export default app;
