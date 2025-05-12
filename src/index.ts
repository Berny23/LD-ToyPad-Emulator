/*
	Copyright © 2023 Berny23, Cort1237 and many more

	This file is part of "Toy Pad Emulator for Lego Dimensions" which is released under the "MIT" license.
	See file "LICENSE" or go to "https://choosealicense.com/licenses/mit" for full license details.
*/
import http from "http";
import app from "./app";
import { unplaceAll } from "./utils/toytags";
import { io, setIO, tp } from "./bridge";
import { setupSocket } from "./io";
import { hook } from "./hooks";
const server = http.createServer(app);

tp.registerDefaults();
setIO(setupSocket(server));
hook(); //Listen to commands from game

InitializeToyTagsJSON();

export function InitializeToyTagsJSON() {
  //I dont know where to put this file
  unplaceAll();
  console.log("Initialized toytags.JSON");
  io.emit(Emits.Refresh);
}

server.listen(80, () => console.log("Server running on port 80"));
