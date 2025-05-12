"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeToyTagsJSON = InitializeToyTagsJSON;
/*
    Copyright © 2023 Berny23, Cort1237 and many more

    This file is part of "Toy Pad Emulator for Lego Dimensions" which is released under the "MIT" license.
    See file "LICENSE" or go to "https://choosealicense.com/licenses/mit" for full license details.
*/
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const toytags_1 = require("./utils/toytags");
const bridge_1 = require("./bridge");
const io_1 = require("./io");
const hooks_1 = require("./hooks");
const server = http_1.default.createServer(app_1.default);
bridge_1.tp.registerDefaults();
(0, bridge_1.setIO)((0, io_1.setupSocket)(server));
(0, hooks_1.hook)(); //Listen to commands from game
InitializeToyTagsJSON();
function InitializeToyTagsJSON() {
    //I dont know where to put this file
    (0, toytags_1.unplaceAll)();
    console.log("Initialized toytags.JSON");
    bridge_1.io.emit(Emits.Refresh);
}
server.listen(80, () => console.log("Server running on port 80"));
