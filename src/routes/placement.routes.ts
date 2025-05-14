import express, { Request, Response } from "express";
import { select, updateKey } from "../utils/toytags";
import { tp } from "../bridge";
import { createCharacter, createVehicle } from "../utils/tagUtils";

const router = express.Router();

router.patch("/", (req: Request, res: Response) => {
  const uid = req.params.uid;
  const id = req.body.id;
  const index = req.body.index;
  const position = req.body.position;
  const entry = select("uid", uid);

  if (!entry) {
    res.status(404).send();
    return;
  }

  let token;
  if (entry.type === "character") {
    token = createCharacter(id, uid);
  } else {
    if (!entry.vehicleUpgradesP23 || !entry.vehicleUpgradesP25) {
      res.status(500).send();
      return;
    }
    token = createVehicle(id, uid, [
      entry.vehicleUpgradesP23,
      entry.vehicleUpgradesP25,
    ]);
  }

  tp.place(token, position, index, token.uid);
  updateKey(token.uid, "index", index);
  res.sendStatus(200);
});
export default router;
