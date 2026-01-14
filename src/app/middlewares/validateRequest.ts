import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest =
  (zodSchema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //   console.log("old body", req.body);
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }

      req.body = await zodSchema.parseAsync(req.body);
      //   console.log("new body", req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
