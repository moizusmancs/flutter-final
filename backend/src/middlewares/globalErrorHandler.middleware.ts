import { NextFunction, Request, Response } from "express";
import CustomError from "../utils/customError.js";

export default (err:CustomError, req:Request, res:Response, next:NextFunction) => {

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || null,
    });
}