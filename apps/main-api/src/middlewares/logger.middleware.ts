import { Logger } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

export function loggerMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.url.includes("/api")) {
    Logger.log({ message: `${req.method}: ${req.url}`, query: req.query, body: req.body, ip: req.ip });
  }
  next();
}
