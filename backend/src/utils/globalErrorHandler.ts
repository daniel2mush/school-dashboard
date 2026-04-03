import { NextFunction, Request, Response } from "express";
import logger from "./logger.js";

export const globalErrorHandler = (
    err:any,
    req:Request,
    res:Response,
    next:NextFunction
)=>{

    const statusCode = err.statusCode || 500
    const status = err.status || "error"

    logger.error(`Status ${statusCode} - Error ${err.message}`)

    res.status(statusCode).json({
        status,
        message: err.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
}