import type { NextFunction, Request, Response } from "express";

export type ActionController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;
