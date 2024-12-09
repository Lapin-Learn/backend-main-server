import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, _: Response, next: NextFunction) {
    Logger.log({ message: `${req.method}: ${req.url}`, query: req.query, body: req.body, ip: req.ip });
    next();
  }
}
