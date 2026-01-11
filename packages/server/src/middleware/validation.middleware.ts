import { Request, Response, NextFunction } from "express";
import { Schema } from "yup";
import { formatYupError } from "../utils/formatYupError";

/**
 * Middleware to validate request body against a Yup schema
 */
export const validate = (schema: Schema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (err: any) {
      return res.status(400).json({
        errors: formatYupError(err),
      });
    }
  };
};
