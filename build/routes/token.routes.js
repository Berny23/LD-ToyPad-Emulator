"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bridge_1 = require("../bridge");
const toytags_1 = require("../utils/toytags");
const router = express_1.default.Router();
router.delete("/", (req, res) => {
    const index = req.body.index;
    const uid = req.params.uid;
    console.log("Removing item: " + index);
    bridge_1.tp.remove(index);
    console.log("Item removed: " + index);
    (0, toytags_1.updateKey)(uid, "index", -1);
    res.status(200);
});
exports.default = router;
