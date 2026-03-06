/**
 * Settings Controller Tests
 */
import '../setup';
import Settings from '../../models/settings.model';
import {
    getSettings,
    updateSettings,
    clearSettings,
} from '../../controllers/settings.controller';
import { Request, Response, NextFunction } from 'express';

const mockReq = (body = {}): Request => ({
    body,
} as unknown as Request);

const mockRes = (): Response => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
};

describe('Settings Controller', () => {
    describe('getSettings', () => {
        it('should return empty settings when none exist', async () => {
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getSettings(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return existing settings', async () => {
            await Settings.create({ companyName: 'TestCo', taxRate: 10 });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getSettings(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.settings.companyName).toBe('TestCo');
        });
    });

    describe('updateSettings', () => {
        it('should create settings if none exist', async () => {
            const req = mockReq({ companyName: 'NewCo', taxRate: 15 });
            const res = mockRes();
            const next = jest.fn();
            await updateSettings(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const settings = await Settings.findOne({});
            expect(settings?.companyName).toBe('NewCo');
        });

        it('should update existing settings', async () => {
            await Settings.create({ companyName: 'OldCo', taxRate: 10 });
            const req = mockReq({ companyName: 'UpdatedCo', taxRate: 20 });
            const res = mockRes();
            const next = jest.fn();
            await updateSettings(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.settings.companyName).toBe('UpdatedCo');
        });
    });

    describe('clearSettings', () => {
        it('should clear all settings', async () => {
            await Settings.create({ companyName: 'ToClear' });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await clearSettings(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const count = await Settings.countDocuments();
            expect(count).toBe(0);
        });
    });
});
