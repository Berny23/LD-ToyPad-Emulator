"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const toytags_1 = require("../utils/toytags");
const bridge_1 = require("../bridge");
const tagUtils_1 = require("../utils/tagUtils");
const router = express_1.default.Router();
router.patch("/", (req, res) => {
    const uid = req.params.uid;
    const id = req.body.id;
    const index = req.body.index;
    const position = req.body.position;
    const entry = (0, toytags_1.select)("uid", uid);
    if (!entry) {
        return res.status(404).send("Token not found.");
    }
    let token;
    if (entry.type === "character") {
        token = (0, tagUtils_1.createCharacter)(id, uid);
    }
    else {
        if (!entry.vehicleUpgradesP23 || !entry.vehicleUpgradesP25) {
            return res.status(500).send("Vehicle upgrades missing.");
        }
        token = (0, tagUtils_1.createVehicle)(id, uid, [
            entry.vehicleUpgradesP23,
            entry.vehicleUpgradesP25,
        ]);
    }
    bridge_1.tp.place(token, position, index, token.uid);
    (0, toytags_1.updateKey)(token.uid, "index", index);
    res.sendStatus(200);
});
exports.default = router;
