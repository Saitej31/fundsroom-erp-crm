import { Router } from "express";
import {
  getChallans,
  getChallan,
  createChallan,
  confirmChallan,
  cancelChallan,
} from "../controllers/challan.controller";

const router = Router();

router.get("/", getChallans);
router.get("/:id", getChallan);
router.post("/", createChallan);
router.post("/:id/confirm", confirmChallan);
router.post("/:id/cancel", cancelChallan);

export default router;