/**
 * Create a minimal Express app for testing without starting the actual server.
 * This avoids side effects from Firebase init, DB connections, etc.
 */
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import { apiErrorMiddleware } from '../../utils/ApiError';

// Route imports
import gatewayRouter from '../../routes/gateway.routes';

export function createTestApp(): Application {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    // Mount the modular gateway
    app.use('/api/v1', gatewayRouter);

    // Error middleware must be last
    app.use(apiErrorMiddleware);

    return app;
}
