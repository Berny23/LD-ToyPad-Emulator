import { Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";
/*
	Copyright © 2023 Berny23, Cort1237 and many more

	This file is part of "Toy Pad Emulator for Lego Dimensions" which is released under the "MIT" license.
	See file "LICENSE" or go to "https://choosealicense.com/licenses/mit" for full license details.
*/

const ld = require("node-ld");

//Setup Webserver
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const {
  getEntryFromUID,
  getUIDFromIndex,
  unplaceAll,
  addEntry,
  updatePadIndex,
  updateKey,
  updateKeys,
  deleteByUID,
} = require("./toytags");
const io = new Server(server);

let isConnectedToGame = false;

//File where tag info will be saved
const tokenmapPath = path.join(__dirname, "server/json/tokenmap.json");
const charactersMapPath = path.join(
  __dirname,
  "server/json/charactersmap.json"
);
const tp = new ld.ToyPadEmu();
tp.registerDefaults();

initializeToyTagsJSON(); //Run in case there were any leftovers from a previous run.

tp.hook(tp.CMD_WRITE, handleWriteCommand);

//Colors
tp.hook(tp.CMD_COL, handleColorCommand);
tp.hook(tp.CMD_FADE, handleFadeCommand);

///NOT IMPLEMENTED///
tp.hook(tp.CMD_FLASH, handleFlashCommand);
tp.hook(tp.CMD_FADRD, handleFadeRandomCommand);
tp.hook(tp.CMD_FADAL, handleFadeAllCommand);
tp.hook(tp.CMD_FLSAL, handleFlashAllCommand);
tp.hook(tp.CMD_COLALL, handleColorAllCommand);

///DEBUG PURPOSES///
tp.hook(tp.CMD_GETCOL, handleGetColorCommand);
tp.hook(tp.CMD_WAKE, handleWakeCommand);
//Create a token JSON object from provided vehicle data
/* Vehicle Data Explained:
 * All data is transfered through a series of buffers. The data from these buffers needs to written to specific points (pages) in the token's
 * buffer for it to be read properly.
 *
 * For vehicles:
 * Page 24 is the ID of the vehicle
 * Pages 23 & 25 are the upgrade data
 */

function createVehicle(
  id: number,
  uid: string,
  upgrades = [0, 0]
): VehicleBuffer {
  const token: any = Buffer.alloc(180);
  token.uid = uid;

  token.writeUInt32LE(upgrades[0], 0x8c); //0x23 * 4
  token.writeUInt16LE(id, 0x90); //0x24 * 4
  token.writeUInt32LE(upgrades[1], 0x94); //0x25 * 4
  token.writeUInt16BE(1, 0x98); //0x26 * 4 Page 26 is used for verification of somekind.
  return token;
}

//Create a token JSON object from provided character data
function createCharacter(id: number, uid: string): CharacterBuffer {
  const token: any = Buffer.alloc(180); // Game really only cares about 0x26 being 0 and D4 returning an ID

  token.uid = uid;
  token.id = id;
  return token;
}

//This function retrieves the name of a vehicle/gadget from an id
function getTokenNameFromID(id: number) {
  const data = fs.readFileSync(tokenmapPath, "utf8");
  const dataset = JSON.parse(data);

  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];

    if (entry.id == id) {
      return entry.name;
    }
  }

  return "N/A";
}
//This function retrieves the name of a character  from an id
function getCharacterNameFromID(id: number) {
  const data = fs.readFileSync(charactersMapPath, "utf8");
  const dataset = JSON.parse(data);

  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];

    if (entry.id == id) {
      return entry.name;
    }
  }

  return "N/A";
}
//This function retrieves the name of a token by id
function getAnyNameFromID(id: number) {
  if (id < 1000) {
    return getTokenNameFromID(id);
  }
  return getCharacterNameFromID(id);
}

//This sets all saved index values to '-1' (meaning unplaced).
function initializeToyTagsJSON() {
  unplaceAll();
  console.log("Initialized toytags.JSON");
  io.emit(Emits.Refresh);
}

function TwoCharacterHex(component: number) {
  return component.toString(16).padStart(2, "0");
}
function RGBToHex(
  r: number,
  g: number,
  b: number,
  applyFilter: boolean = true
) {
  const components = {
    red: TwoCharacterHex(r),
    green: TwoCharacterHex(g),
    blue: TwoCharacterHex(b),
  };

  const hex = `#${components.red}${components.green}${components.blue}`;

  if (!applyFilter) {
    return hex;
  }

  switch (hex) {
    //idle (full white)
    case "#99420e":
      return "#ffffff";

    //rainbow sequence (title screen, some are used by keystones)
    //case "#ff0000": //red
    //break;
    case "#ff6e00":
      return "#ffff00"; //yellow
    case "#006e00":
      return "#00ff00"; //green
    case "#006e18":
      return "#00ffff"; //cyan
    //also batman stealth
    case "#000018":
      return "#0000ff"; //blue
    case "#ff0018":
      return "#ff00ff"; //pink

    //wyldstyle scanner
    case "#f00016":
      return "#ff2de6";

    //shift keystone (dark colors for blink animation)
    case "#002007":
      return "#007575";
    case "#4c2000":
      return "#757500";
    case "#4c0007":
      return "#750075";

    //chroma keystone

    case "#3f1b05":
      return "#b0b0b0";
    case "#4c2007":
      return "#757575";
    case "#3f1b00":
      return "#b0b000";
    case "#3f0000":
      return "#b00000";
    case "#000005":
      return "#0000b0";
    case "#001b00":
      return "#00b000";
    case "#ff2700":
      return "#ffa200";
    case "#3f0900":
      return "#b06f00";
    case "#44000d":
      return "#d500ff";
    case "#110003":
      return "#9300b0";

    //element keystone
    case "#000016":
      return "#0000ff";
    case "#006700":
      return "#00ff00";
    case "#f00000":
      return "#ff0000";
    case "#000016":
      return "#00ffff";

    //scale keystone
    case "#ff1e00":
      return "#ffa200";
    case "#f06716":
      return "#ffffff";

    //locate keystone (too many possible values to find by hand. need help here)

    //green (hack minigame)
    case "#003700":
      return "#00ff00";

    //other
    case "#ff6e18":
      return "#ffffff";

    default:
      return hex;
  }
}

function getUIDAtPad(index: number) {
  const token = tp._tokens.find((t: any) => t.index === index); //TODO: Implement interface
  return token ? token.uid : -1;
}
//When the game calls 'CMD_WRITE', writes the given data to the toytag in the top position.
/* Writing Tags Explained:
 * A write occurs in three seperate function calls, and will repreat until either the write is canceled in game,
 * or all three calls successfully write data.
 *
 * To appease the game all data is passed through and copied to the token in the top pad. But during this we can intercept what is being written
 * and save the data locally as well. This lets us call that data back when we want to use that tag again.
 *
 * payload[1] tells what page is being written, and everything after is the data.
 * page 24 - ID
 * page 23 - Vehicle Upgrade Pt 1
 * page 26 - Vehicle Upgrades Pt 2
 * **When writing the pages requested for the write are sometimes offset by 12, not sure why.
 * //TODO: Find out why they are sometimes offset by 12
 * This data is copied to the JSON for future use.
 */
function handleWriteCommand(req: any, res: any) {
  const ind = req.payload[0];
  const page = req.payload[1];
  const data = req.payload.slice(2);
  const uid = getUIDFromIndex(ind);
  console.log("REQUEST (CMD_WRITE): index:", ind, "page", page, "data", data);

  //The ID is stored in page 24
  if (page == 24 || page == 36) {
    const id = data.readInt16LE(0);
    const name = getAnyNameFromID(id);

    updateKeys(uid, [
      { key: "id", value: id },
      { key: "name", value: name },
      { key: "type", value: "vehicle" },
    ]);
    //writeVehicleData(uid, "uid", tp.randomUID())
  }
  //Vehicle uprades are stored in Pages 23 & 25
  else if (page == 23 || page == 35)
    updateKey(uid, "vehicleUpgradesP23", data.readUInt32LE(0));
  else if (page == 25 || page == 37) {
    updateKey(uid, "vehicleUpgradesP25", data.readUInt32LE(0));
    io.emit(Emits.Refresh); //Refreshes the html's tag gui.
  }

  res.payload = Buffer.from([0x00]);
  const token = tp._tokens.find((t: any) => t.index == ind);
  if (token) {
    req.payload.copy(token.token, 4 * page, 2, 6);
  }
}
function handleColorCommand(req: any, res: any) {
  console.log("    => CMD_COL");
  console.log("    => pad:", req.payload[0]);
  console.log("    => red:", req.payload[1]);
  console.log("    => green:", req.payload[2]);
  console.log("    => blue:", req.payload[3]);
  const pad_number = req.payload[0];
  const pad_color = RGBToHex(req.payload[1], req.payload[2], req.payload[3]);
  if (pad_number == 0)
    io.emit(Emits.ColorAll, [pad_color, pad_color, pad_color]);
  else io.emit(Emits.ColorOne, [pad_number, pad_color]);
}
function handleFadeCommand(req: any, res: any) {
  const pad_number = req.payload[0];
  const pad_speed = req.payload[1];
  const pad_cycles = req.payload[2];
  const pad_color = RGBToHex(req.payload[3], req.payload[4], req.payload[5]);
  io.emit(Emits.FadeOne, [pad_number, pad_speed, pad_cycles, pad_color]);
}
function handleFlashCommand(req: any, res: any) {
  console.log("    => CMD_FLASH");
  console.log("    => pad:", req.payload[0]);
  console.log("    => color duration:", req.payload[1]);
  console.log("    => white duration:", req.payload[2]);
  console.log("    => cycles:", req.payload[3]);
  console.log("    => red:", req.payload[4]);
  console.log("    => green:", req.payload[5]);
  console.log("    => blue:", req.payload[6]);
}

function handleFadeRandomCommand(req: any, res: any) {
  console.log("    => CMD_FADRD - pad:", req.payload[0]);
  console.log("    => speed:", req.payload[1]);
  console.log("    => cycles:", req.payload[2]);
}
function handleFadeAllCommand(req: any, res: any) {
  const top_pad_speed = req.payload[1];
  const top_pad_cycles = req.payload[2];
  const top_pad_color = RGBToHex(
    req.payload[3],
    req.payload[4],
    req.payload[5]
  );
  const left_pad_speed = req.payload[7];
  const left_pad_cycles = req.payload[8];
  const left_pad_color = RGBToHex(
    req.payload[9],
    req.payload[10],
    req.payload[11]
  );
  const right_pad_speed = req.payload[13];
  const right_pad_cycles = req.payload[14];
  const right_pad_color = RGBToHex(
    req.payload[15],
    req.payload[16],
    req.payload[17]
  );

  io.emit(Emits.FadeAll, [
    top_pad_speed,
    top_pad_cycles,
    top_pad_color,
    left_pad_speed,
    left_pad_cycles,
    left_pad_color,
    right_pad_speed,
    right_pad_cycles,
    right_pad_color,
  ]);
}
function handleFlashAllCommand(req: any, res: any) {
  console.log("    => CMD_FLSAL - top pad color duration:", req.payload[1]);
  console.log("    => top pad white duration:", req.payload[2]);
  console.log("    => top pad cycles:", req.payload[3]);
  console.log("    => top pad red:", req.payload[4]);
  console.log("    => top pad green:", req.payload[5]);
  console.log("    => top pad blue:", req.payload[6]);
  console.log("    => left pad color duration:", req.payload[8]);
  console.log("    => left pad white duration:", req.payload[9]);
  console.log("    => left pad cycles:", req.payload[10]);
  console.log("    => left pad red:", req.payload[11]);
  console.log("    => left pad green:", req.payload[12]);
  console.log("    => left pad blue:", req.payload[13]);
  console.log("    => right pad color duration:", req.payload[15]);
  console.log("    => right pad white duration:", req.payload[16]);
  console.log("    => right pad cycles:", req.payload[17]);
  console.log("    => right pad red:", req.payload[18]);
  console.log("    => right pad green:", req.payload[19]);
  console.log("    => right pad blue:", req.payload[20]);
}
function handleColorAllCommand(req: any, res: any) {
  console.log("    => CMD_COLAL");
  const top_pad_color = RGBToHex(
    req.payload[1],
    req.payload[2],
    req.payload[3]
  );
  const left_pad_color = RGBToHex(
    req.payload[5],
    req.payload[6],
    req.payload[7]
  );
  const right_pad_color = RGBToHex(
    req.payload[9],
    req.payload[10],
    req.payload[11]
  );

  io.emit(Emits.ColorAll, [top_pad_color, left_pad_color, right_pad_color]);
}
function handleGetColorCommand(req: any, res: any) {
  console.log("    => CMD_GETCOL");
  console.log("    => pad:", req.payload[0]);
}
function handleWakeCommand(req: any, res: any) {
  isConnectedToGame = true;
  io.emit(Emits.ConnectionAffirmation);
}

//** Express **/
app.use(express.json());
app.use(express.static(path.join(__dirname, "../", "public")));

//**Website requests**//
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "server/index.html"));
});

//Create a new Character and save that data to toytags.json
app.post("/character", (req: Request, res: Response) => {
  const uid = tp.randomUID();
  const id = req.body.id;
  console.log("Creating character: " + id);
  const character = createCharacter(id, uid);
  const name = getCharacterNameFromID(id);

  console.log(
    "name: " + name,
    " uid: " + character.uid,
    " id: " + character.id
  );

  const entry: Toytag = {
    name: name,
    id: id,
    uid: character.uid,
    index: -1,
    type: Tagtypes.Character,
    vehicleUpgradesP23: 0,
    vehicleUpgradesP25: 0,
  };

  addEntry(entry);

  console.log("Character created: " + req.body.id);
  res.status(200).send();
});

//This is called when a token is placed or move onto a position on the toypad.
app.post("/place", (req: Request, res: Response) => {
  const id = req.body.id;
  const uid = req.body.uid;
  const index = req.body.index;
  const position = req.body.position;
  const entry = getEntryFromUID(uid);

  let token;
  if (entry.type == "character") {
    token = createCharacter(id, uid);
  } else {
    token = createVehicle(id, uid, [
      entry.vehicleUpgradesP23,
      entry.vehicleUpgradesP25,
    ]);
  }
  tp.place(token, position, index, token.uid);
  updatePadIndex(token.uid, index);
  res.send();
});

app.post("/vehicle", (req: Request, res: Response) => {
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

//This is called when a token needs to be removed from the pad.
app.delete("/remove", (req: Request, res: Response) => {
  const index = req.body.index;
  const uid = req.body.uid;
  console.log("Removing item: " + index);
  tp.remove(index);
  console.log("Item removed: " + index);
  updatePadIndex(uid, -1);
  res.send(true);
});

//**IO CALLS**//
//This setups the IO connection between frontend and server
io.on("connection", (socket: Socket) => {
  //Listening for 'deleteToken' call from frontend
  socket.on("deleteToken", (uid: string) => {
    console.log("IO Recieved: Deleting entry " + uid + " from JSON");
    deleteByUID(uid);
    io.emit(Emits.Refresh);
  });

  socket.on("connectionStatus", () => {
    if (isConnectedToGame == true) {
      io.emit(Emits.ConnectionAffirmation);
    }
  });

  socket.on("syncToyPad", () => {
    console.log("<<Syncing tags, one moment...>>");
    initializeToyTagsJSON();
    for (let i = 1; i <= 7; i++) {
      const uid = getUIDAtPad(i);
      if (uid != -1) {
        //console.log(uid, "is at pad #", i);
        updateKey(uid, "index", i);
      }
    }
    io.sockets.emit(Emits.Refresh);
    console.log("<<Tags are synced!>>");
  });
});

server.listen(80, () => console.log("Server running on port 80"));

export default app;
