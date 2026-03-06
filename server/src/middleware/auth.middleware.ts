import { NextFunction, Request, Response } from 'express';
import { admin } from '../config/firebase.config';
import User from '../models/user.model';
import { User as UserInterface } from '../types/types';


interface RequestWithUser extends Request {
    user?: UserInterface;
}

export const authenticateUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let idToken = req.cookies?.token;

    // Fallback to Authorization header if cookie is missing
    if (!idToken && req.headers.authorization?.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split(' ')[1];
    }

    if (!idToken) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email } = decodedToken;

        let user = await User.findOne({ uid });

        // Fallback for migrated users
        if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
                user.uid = uid;
                await user.save();
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const adminOnly = (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized , Admin Only Route' });
    }

    next();
};

/**
 * Soft/optional authentication.
 * Attaches req.user if a valid token is present, but NEVER blocks the request.
 * Use this on public routes where you want to enrich the request for logged-in
 * users (e.g. to honour admin-only query params) without blocking guests.
 */
export const optionalAuth = async (req: RequestWithUser, _res: Response, next: NextFunction) => {
    let idToken = req.cookies?.token;

    // Fallback to Authorization header if cookie is missing
    if (!idToken && req.headers.authorization?.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split(' ')[1];
    }

    if (!idToken) return next(); // Guest — continue without user

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        let user = await User.findOne({ uid: decodedToken.uid });
        if (!user && decodedToken.email) {
            user = await User.findOne({ email: decodedToken.email });
            if (user) {
                user.uid = decodedToken.uid;
                await user.save();
            }
        }
        if (user) req.user = user;
    } catch {
        // Invalid or expired token — treat as guest, don't block
    }

    next();
};