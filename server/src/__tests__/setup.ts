import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import * as admin from 'firebase-admin';

let mongoServer: MongoMemoryServer;

// Mock firebase-admin globally
jest.mock('firebase-admin', () => {
    const mockAuth = {
        verifyIdToken: jest.fn(),
    };
    return {
        auth: jest.fn().mockReturnValue(mockAuth),
        credential: {
            cert: jest.fn(),
        },
        initializeApp: jest.fn(),
        default: {
            auth: jest.fn().mockReturnValue(mockAuth),
            initializeApp: jest.fn(),
        }
    };
});

// Mock Stripe config globally to avoid errors when env vars are missing
jest.mock('../config/stripe.config', () => ({
    __esModule: true,
    default: {
        paymentIntents: {
            create: jest.fn().mockResolvedValue({ client_secret: 'mock_secret' }),
        },
    },
}));

// Start in-memory MongoDB before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

// Clear all collections after each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

// Disconnect and stop MongoDB after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
