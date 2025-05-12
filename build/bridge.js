"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnectedToGame = exports.io = exports.tp = void 0;
exports.setIO = setIO;
exports.setConnectionStatus = setConnectionStatus;
const ld = require("node-ld");
exports.tp = new ld.ToyPadEmu();
exports.isConnectedToGame = false;
function setIO(server) {
    exports.io = server;
}
function setConnectionStatus(status) {
    exports.isConnectedToGame = status;
}
