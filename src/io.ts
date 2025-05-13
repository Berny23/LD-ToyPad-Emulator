import { Socket } from "socket.io";
import { isConnectedToGame, tp } from "./bridge";
import { deleteEntry, updateKey } from "./utils/toytags";
import { InitializeToyTagsJSON } from ".";
import { Emits } from "./enums/Emits";
import { Server } from "http";

export function setupSocket(http: Server) {
  const io = require("socket.io")(http);
  io.on("connection", (socket: Socket) => {
    socket.on("deleteToken", (uid: string) => {
      console.log("IO Recieved: Deleting entry " + uid + " from JSON");
      deleteEntry("uid", uid);
      io.emit(Emits.Refresh);
    });

    socket.on("connectionStatus", () => {
      if (isConnectedToGame) {
        io.emit(Emits.ConnectionAffirmation);
      } else {
        io.emit(Emits.ConnectionDenial);
      }
    });

    socket.on("syncToyPad", () => {
      console.log("<<Syncing tags, one moment...>>");
      InitializeToyTagsJSON();
      for (let i = 1; i <= 7; i++) {
        const uid = getUIDAtPad(i);
        if (uid != -1) {
          updateKey(uid, "index", i);
        }
      }
      io.emit(Emits.Refresh);
      console.log("<<Tags are synced!>>");
    });
  });
  return io;
}
function getUIDAtPad(index: number) {
  const token = tp._tokens.find((t: any) => t.index === index);
  return token ? token.uid : -1;
}
