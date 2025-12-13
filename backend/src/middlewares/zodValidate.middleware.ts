// src/middlewares/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import CustomError from "../utils/customError.js";

export const zodValidate =
  (schema: ZodType, location: "body" | "query" | "params" = "body") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate =
        location === "body"
          ? req.body
          : location === "query"
          ? req.query
          : req.params;


      const parsedData = await schema.parseAsync(dataToValidate);

      if (location === "body") {
        req.body = parsedData as any;
      } else if (location === "query") {
        // Cannot directly assign to req.query, so we assign to each property
        Object.keys(parsedData as any).forEach(key => {
          (req.query as any)[key] = (parsedData as any)[key];
        });
      } else if (location === "params") {
        req.params = parsedData as any;
      }

      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const formatted = err.issues.map(issue => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        return next(new CustomError("Validation failed", 400, formatted));
      }

      next(err);

    }
  };


