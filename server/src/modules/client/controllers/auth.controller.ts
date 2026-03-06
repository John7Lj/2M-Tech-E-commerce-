import { NextFunction, Request, Response } from 'express';
import { admin } from '../../../config/firebase.config';
import User, { IUser } from '../../../models/user.model';
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';
import { RequestWithUser } from '../../../types/types';

// Enhanced cookie options for production
const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction, // Only use secure in production
        sameSite: isProduction ? 'none' as const : 'lax' as const, // 'none' for cross-origin in production
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        domain: isProduction ? undefined : undefined, // Let browser handle domain
        path: '/'
    };
};

// Login
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { idToken } = req.body;

    if (!idToken) {
        return next(new ApiError(400, 'ID token is required'));
    }

    let decodedToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error: any) {
        return next(new ApiError(401, 'Invalid or expired token: ' + error.message));
    }

    const { uid, email } = decodedToken;
    let user: IUser | null = await User.findOne({ uid });

    // Fallback for migrated users
    if (!user && email) {
        user = await User.findOne({ email });
        if (user) {
            user.uid = uid;
            await user.save();
        }
    }

    if (!user) {
        return next(new ApiError(401, 'User not found. Please sign up first.'));
    }

    res.cookie('token', idToken, getCookieOptions());

    return res.status(200).json({
        success: true,
        message: 'Login successful',
        user,
    });
});

// Signup
export const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { idToken, name, gender, dob } = req.body;

    if (!idToken) {
        return next(new ApiError(400, 'ID token is required'));
    }

    // Validate required fields
    if (!name || !name.trim()) {
        return next(new ApiError(400, 'Name is required'));
    }
    if (!gender) {
        return next(new ApiError(400, 'Gender is required'));
    }
    if (!dob) {
        return next(new ApiError(400, 'Date of birth is required'));
    }
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime()) || dobDate >= new Date()) {
        return next(new ApiError(400, 'Valid date of birth is required'));
    }

    let decodedToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error: any) {
        return next(new ApiError(401, 'Invalid or expired token: ' + error.message));
    }

    const { uid, email, picture } = decodedToken;

    // Check if user already exists (by UID or Email for migrated accounts) — return 200 with cookie
    const existingUser = await User.findOne({ $or: [{ uid }, { email }] });
    if (existingUser) {
        if (existingUser.uid !== uid) {
            existingUser.uid = uid;
            await existingUser.save();
        }
        res.cookie('token', idToken, getCookieOptions());
        return res.status(200).json({
            success: true,
            message: 'User already exists, logged in',
            user: existingUser,
        });
    }

    const user = new User({
        uid,
        email,
        name: name.trim(),
        photoURL: picture,
        provider: decodedToken.firebase.sign_in_provider,
        gender,
        dob,
    });

    await user.save();

    res.cookie('token', idToken, getCookieOptions());

    return res.status(201).json({
        success: true,
        message: 'Signup successful',
        user,
    });
});

export const getMe = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.user) {
        return res.status(200).json({ success: true, user: req.user });
    } else {
        return next(new ApiError(404, 'User not found'));
    }
});

export const logoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const cookieOptions = getCookieOptions();

    // Clear cookie with same options used to set it
    res.clearCookie('token', {
        ...cookieOptions,
        maxAge: 0
    });

    return res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
});

export const updateProfile = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new ApiError(401, 'User not authenticated'));
    }

    const { name, gender, dob } = req.body;
    const userId = req.user._id;

    // Prepare update data
    const updateData: Partial<IUser> = {};

    if (name && name.trim()) {
        updateData.name = name.trim();
    }

    if (gender) {
        updateData.gender = gender;
    }

    if (dob) {
        const dobDate = new Date(dob);
        if (isNaN(dobDate.getTime())) {
            return next(new ApiError(400, 'Invalid date of birth'));
        }
        updateData.dob = dobDate;
    }

    // Handle photo upload if file is present
    if (req.file) {
        if (req.file.path) {
            updateData.photoURL = req.file.path; // Cloudinary URL
        }
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
        return next(new ApiError(400, 'No valid fields to update'));
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        {
            new: true, // Return updated document
            runValidators: true // Run mongoose validators
        }
    );

    if (!updatedUser) {
        return next(new ApiError(404, 'User not found'));
    }

    return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
    });
});
