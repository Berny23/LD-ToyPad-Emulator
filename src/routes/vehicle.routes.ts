import express, { Request, Response } from "express";
import { tp } from "../bridge";
import { addEntry, updateKey } from "../utils/toytags";
import { createVehicle, getTokenNameFromID } from "../utils/tagUtils";

const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  const id = req.body.id;
  const uid = tp.randomUID();
  const vehicle = createVehicle(id, uid, [0xefffffff, 0xefffffff]);
  const name = getTokenNameFromID(id);
  console.log("Creating vehicle: " + req.body.id);

  console.log("name: " + name, " uid: " + vehicle.uid, " id: " + vehicle.id);

  const entry: Toytag = {
    name: name,
    id: id,
    uid: vehicle.uid,
    index: -1,
    type: Tagtypes.Vehicle,
    vehicleUpgradesP23: 0xefffffff,
    vehicleUpgradesP25: 0xefffffff,
  };

  addEntry(entry);
  console.log("Vehicle placed: " + req.body.id);
  res.send(uid);
});
export default router;
