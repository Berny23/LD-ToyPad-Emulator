"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tagUtils_1 = require("../utils/tagUtils");
const bridge_1 = require("../bridge");
const toytags_1 = require("../utils/toytags");
const router = express_1.default.Router();
router.post("/", (req, res) => {
    const uid = bridge_1.tp.randomUID();
    const id = req.body.id;
    console.log("Creating character: " + id);
    const character = (0, tagUtils_1.createCharacter)(id, uid);
    const name = (0, tagUtils_1.getCharacterNameFromID)(id);
    console.log("name: " + name, " uid: " + character.uid, " id: " + character.id);
    const entry = {
        name: name,
        id: id,
        uid: character.uid,
        index: -1,
        type: Tagtypes.Character,
        vehicleUpgradesP23: 0,
        vehicleUpgradesP25: 0,
    };
    (0, toytags_1.addEntry)(entry);
    console.log("Character created: " + req.body.id);
    res.status(200).send();
});
exports.default = router;
