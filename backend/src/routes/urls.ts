import { Router } from "express";
import * as urlController from "../controllers/urlController.js";

const router = Router();

router.post("/", urlController.createUrl);
router.get("/", urlController.listUrls);
router.get("/:id/history", urlController.getUrlHistory);

export default router;
