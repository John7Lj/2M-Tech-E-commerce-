import * as admin from 'firebase-admin';

// Mock firebase-admin globally for integration tests
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

export const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;

/**
 * Helper to mock a successful Firebase authentication
 */
export const mockAuthSuccess = (uid: string) => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid });
};

/**
 * Helper to mock an authentication failure
 */
export const mockAuthFailure = (message = 'Invalid token') => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error(message));
};
