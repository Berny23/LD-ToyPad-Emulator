"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bridge_1 = require("../bridge");
const toytags_1 = require("../utils/toytags");
const tagUtils_1 = require("../utils/tagUtils");
const router = express_1.default.Router();
router.post("/", (req, res) => {
    const id = req.body.id;
    const uid = bridge_1.tp.randomUID();
    const vehicle = (0, tagUtils_1.createVehicle)(id, uid, [0xefffffff, 0xefffffff]);
    const name = (0, tagUtils_1.getTokenNameFromID)(id);
    console.log("Creating vehicle: " + req.body.id);
    console.log("name: " + name, " uid: " + vehicle.uid, " id: " + vehicle.id);
    const entry = {
        name: name,
        id: id,
        uid: vehicle.uid,
        index: -1,
        type: Tagtypes.Vehicle,
        vehicleUpgradesP23: 0xefffffff,
        vehicleUpgradesP25: 0xefffffff,
    };
    (0, toytags_1.addEntry)(entry);
    console.log("Vehicle placed: " + req.body.id);
    res.send(uid);
});
exports.default = router;
