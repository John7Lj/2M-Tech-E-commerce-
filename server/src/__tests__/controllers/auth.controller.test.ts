/**
 * Auth Controller Tests
 * Tests login, signup, getMe, logout, getAllUsers, getUser, updateProfile
 * Note: Firebase verifyIdToken is mocked since we can't call real Firebase in tests.
 */
import '../setup';
import User from '../../models/user.model';
import * as admin from 'firebase-admin';
import { getAllUsers, getUser } from '../../modules/admin/controllers/auth.controller';
import { login, signup, getMe, logoutUser, updateProfile } from '../../modules/client/controllers/auth.controller';
import { Request, Response, NextFunction } from 'express';

// Mock firebase-admin
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
        // Handle default export if needed
        default: {
            auth: jest.fn().mockReturnValue(mockAuth),
            initializeApp: jest.fn(),
        }
    };
});

const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;

const mockReq = (body = {}, params = {}, user: any = null, file: any = null): any => ({
    body,
    params,
    user,
    file,
});

const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
};

describe('Auth Controller', () => {
    beforeEach(() => {
        mockVerifyIdToken.mockReset();
    });

    // ─── Login ────────────────────────────────────────────────
    describe('login', () => {
        it('should reject missing idToken', async () => {
            const req = mockReq({});
            const res = mockRes();
            const next = jest.fn();
            await login(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(400);
            expect(next.mock.calls[0][0].message).toContain('token');
        });

        it('should reject invalid Firebase token', async () => {
            mockVerifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));
            const req = mockReq({ idToken: 'bad-token' });
            const res = mockRes();
            const next = jest.fn();
            await login(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should reject non-existent user', async () => {
            mockVerifyIdToken.mockResolvedValueOnce({ uid: 'unknown-uid' });
            const req = mockReq({ idToken: 'valid-token' });
            const res = mockRes();
            const next = jest.fn();
            await login(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(401);
            expect(next.mock.calls[0][0].message).toContain('sign up');
        });

        it('should login existing user and set cookie', async () => {
            await User.create({
                uid: 'existing-uid', email: 'test@test.com', name: 'Test',
                provider: 'google.com', gender: 'male', dob: new Date('2000-01-01'),
            });
            mockVerifyIdToken.mockResolvedValueOnce({ uid: 'existing-uid' });
            const req = mockReq({ idToken: 'valid-token' });
            const res = mockRes();
            const next = jest.fn();
            await login(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.cookie).toHaveBeenCalledWith('token', 'valid-token', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            const data = res.json.mock.calls[0][0];
            expect(data.success).toBe(true);
            expect(data.user.email).toBe('test@test.com');
        });
    });

    // ─── Signup ───────────────────────────────────────────────
    describe('signup', () => {
        it('should reject missing idToken', async () => {
            const req = mockReq({ name: 'Test', gender: 'male', dob: '2000-01-01' });
            const res = mockRes();
            const next = jest.fn();
            await signup(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });

        it('should reject missing name', async () => {
            const req = mockReq({ idToken: 'token', gender: 'male', dob: '2000-01-01' });
            const res = mockRes();
            const next = jest.fn();
            await signup(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('Name');
        });

        it('should reject missing gender', async () => {
            const req = mockReq({ idToken: 'token', name: 'Test', dob: '2000-01-01' });
            const res = mockRes();
            const next = jest.fn();
            await signup(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('Gender');
        });

        it('should reject future date of birth', async () => {
            const req = mockReq({
                idToken: 'token', name: 'Test', gender: 'male',
                dob: new Date(Date.now() + 86400000).toISOString(),
            });
            const res = mockRes();
            const next = jest.fn();
            await signup(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('date of birth');
        });

        it('should reject invalid Firebase token', async () => {
            mockVerifyIdToken.mockRejectedValueOnce(new Error('bad'));
            const req = mockReq({ idToken: 'bad', name: 'Test', gender: 'male', dob: '2000-01-01' });
            const res = mockRes();
            const next = jest.fn();
            await signup(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should create new user and return 201', async () => {
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: 'brand-new-uid', email: 'new@test.com', picture: 'http://photo.url',
                firebase: { sign_in_provider: 'google.com' },
            });
            const req = mockReq({ idToken: 'token', name: 'New User', gender: 'male', dob: '2000-06-15' });
            const res = mockRes();
            const next = jest.fn();
            await signup(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.cookie).toHaveBeenCalled();
            const data = res.json.mock.calls[0][0];
            expect(data.user.name).toBe('New User');
            // Verify user was saved in DB
            const dbUser = await User.findOne({ uid: 'brand-new-uid' });
            expect(dbUser).not.toBeNull();
            expect(dbUser!.email).toBe('new@test.com');
        });

        it('should return existing user on duplicate signup (200)', async () => {
            await User.create({
                uid: 'dup-uid', email: 'dup@test.com', name: 'Existing',
                provider: 'google.com', gender: 'female', dob: new Date('1995-01-01'),
            });
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: 'dup-uid', email: 'dup@test.com', picture: null,
                firebase: { sign_in_provider: 'google.com' },
            });
            const req = mockReq({ idToken: 'token', name: 'New Name', gender: 'male', dob: '2000-01-01' });
            const res = mockRes();
            const next = jest.fn();
            await signup(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0].message).toContain('already exists');
        });
    });

    // ─── getMe ────────────────────────────────────────────────
    describe('getMe', () => {
        it('should return user if attached to request', async () => {
            const user = { _id: '123', name: 'Test', email: 'test@test.com' };
            const req = mockReq({}, {}, user);
            const res = mockRes();
            const next = jest.fn();
            await getMe(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0].user).toEqual(user);
        });

        it('should return 404 if no user on request', async () => {
            const req = mockReq({}, {}, null);
            const res = mockRes();
            const next = jest.fn();
            await getMe(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    // ─── logoutUser ───────────────────────────────────────────
    describe('logoutUser', () => {
        it('should clear cookie and return success', async () => {
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await logoutUser(req, res, next);
            expect(res.clearCookie).toHaveBeenCalledWith('token', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0].success).toBe(true);
        });
    });

    // ─── getAllUsers ───────────────────────────────────────────
    describe('getAllUsers', () => {
        it('should return all users', async () => {
            await User.create({ uid: 'u1', email: 'u1@t.com', name: 'U1', provider: 'g', gender: 'male', dob: new Date('2000-01-01') });
            await User.create({ uid: 'u2', email: 'u2@t.com', name: 'U2', provider: 'g', gender: 'female', dob: new Date('2000-01-01') });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllUsers(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0].users).toHaveLength(2);
        });
    });

    // ─── getUser ──────────────────────────────────────────────
    describe('getUser', () => {
        it('should return a user by ID', async () => {
            const user = await User.create({
                uid: 'gu1', email: 'gu@t.com', name: 'GetUser', provider: 'g', gender: 'male', dob: new Date('2000-01-01'),
            });
            const req = mockReq({}, { id: user._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await getUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0].user.name).toBe('GetUser');
        });

        it('should return 404 for non-existent user', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await getUser(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    // ─── updateProfile ────────────────────────────────────────
    describe('updateProfile', () => {
        it('should reject unauthenticated request', async () => {
            const req = mockReq({ name: 'New Name' }, {}, null);
            const res = mockRes();
            const next = jest.fn();
            await updateProfile(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should update user name', async () => {
            const user = await User.create({
                uid: 'up1', email: 'up@t.com', name: 'OldName', provider: 'g', gender: 'male', dob: new Date('2000-01-01'),
            });
            const req = mockReq({ name: 'NewName' }, {}, { _id: user._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateProfile(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const dbUser = await User.findById(user._id);
            expect(dbUser!.name).toBe('NewName');
        });

        it('should reject when no fields provided', async () => {
            const user = await User.create({
                uid: 'up2', email: 'up2@t.com', name: 'Name', provider: 'g', gender: 'female', dob: new Date('2000-01-01'),
            });
            const req = mockReq({}, {}, { _id: user._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateProfile(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('No valid fields');
        });

        it('should update photo if file uploaded', async () => {
            const user = await User.create({
                uid: 'up3', email: 'up3@t.com', name: 'Name', provider: 'g', gender: 'male', dob: new Date('2000-01-01'),
            });
            const req = mockReq({}, {}, { _id: user._id.toString() }, { path: 'http://cloud.com/new-photo.jpg' });
            const res = mockRes();
            const next = jest.fn();
            await updateProfile(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const dbUser = await User.findById(user._id);
            expect(dbUser!.photoURL).toBe('http://cloud.com/new-photo.jpg');
        });
    });
});
