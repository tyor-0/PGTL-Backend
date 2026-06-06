import { Router } from "express";
import upload from "../middlewares/uploadMiddleware";
import { reconcileFiles } from "../controllers/reconcileController";

const router = Router();

router.post( "/", upload.fields([{ name: "sourceA", maxCount: 1 }, { name: "sourceB", maxCount: 1 }, ]), reconcileFiles, );

export default router;