"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const http_1 = require("http");
const bridge_1 = require("./bridge");
const toytags_1 = require("./utils/toytags");
const _1 = require(".");
function setupSocket(server) {
    const io = new http_1.Server(server);
    io.on("connection", (socket) => {
        socket.on("deleteToken", (uid) => {
            console.log("IO Recieved: Deleting entry " + uid + " from JSON");
            (0, toytags_1.deleteEntry)("uid", uid);
            io.emit(Emits.Refresh);
        });
        socket.on("connectionStatus", () => {
            if (bridge_1.isConnectedToGame) {
                io.emit(Emits.ConnectionAffirmation);
            }
            else {
                io.emit(Emits.ConnectionDenial);
            }
        });
        socket.on("syncToyPad", () => {
            console.log("<<Syncing tags, one moment...>>");
            (0, _1.InitializeToyTagsJSON)();
            for (let i = 1; i <= 7; i++) {
                const uid = getUIDAtPad(i);
                if (uid != -1) {
                    (0, toytags_1.updateKey)(uid, "index", i);
                }
            }
            io.emit(Emits.Refresh);
            console.log("<<Tags are synced!>>");
        });
    });
    return io;
}
function getUIDAtPad(index) {
    const token = bridge_1.tp._tokens.find((t) => t.index === index);
    return token ? token.uid : -1;
}
