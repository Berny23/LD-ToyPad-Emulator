import express, { Request, Response } from "express";
import { tp } from "../bridge";
import { updateKey } from "../utils/toytags";

const router = express.Router();

router.delete("/", (req: Request, res: Response) => {
  const index = req.body.index;
  const uid = req.params.uid;
  console.log("Removing item: " + index);
  tp.remove(index);
  console.log("Item removed: " + index);
  updateKey(uid, "index", -1);
  res.status(200);
});
export default router;
