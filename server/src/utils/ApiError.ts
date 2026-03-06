import { NextFunction, Request, Response } from 'express';

class ApiError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

const apiErrorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID";
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
}

export { ApiError, apiErrorMiddleware }