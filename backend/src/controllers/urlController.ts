import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import * as urlService from "../services/urlService.js";

export function createUrl(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.body || typeof req.body !== "object" || !("url" in req.body)) {
      throw new AppError(400, "Request body must include a url field");
    }

    const created = urlService.createUrl(req.body.url);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

export function listUrls(_req: Request, res: Response, next: NextFunction): void {
  try {
    const urls = urlService.listUrls();
    res.json(urls);
  } catch (error) {
    next(error);
  }
}

export function getUrlHistory(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "Invalid URL id");
    }

    const history = urlService.getUrlHistory(id);
    res.json(history);
  } catch (error) {
    next(error);
  }
}
