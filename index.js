/*
	Copyright © 2023 Berny23, Cort1237 and many more

	This file is part of "Toy Pad Emulator for Lego Dimensions" which is released under the "MIT" license.
	See file "LICENSE" or go to "https://choosealicense.com/licenses/mit" for full license details.
*/

const ld = require("node-ld");
const fs = require("fs");
const path = require("path");

//Setup Webserver
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//File where tag info will be saved
const toytagsPath = path.join(__dirname, "server/json/toytags.json");
const tokenmapPath = path.join(__dirname, "server/json/tokenmap.json");
const charactersMapPath = path.join(
  __dirname,
  "server/json/charactersmap.json"
);
const tp = new ld.ToyPadEmu();
tp.registerDefaults();

initializeToyTagsJSON(); //Run in case there were any leftovers from a previous run.

let isConnectedToGame = false;

//Create a token JSON object from provided vehicle data
/* Vehicle Data Explained:
 * All data is transfered through a series of buffers. The data from these buffers needs to written to specific points (pages) in the token's
 * buffer for it to be read properly.
 *
 * For vehicles:
 * Page 24 is the ID of the vehicle
 * Pages 23 & 25 are the upgrade data
 */

function createVehicle(id, uid, upgrades = [0, 0]) {
  const token = Buffer.alloc(180);
  token.uid = uid;
  //console.log(upgrades);
  token.writeUInt32LE(upgrades[0], 0x8c); //0x23 * 4
  token.writeUInt16LE(id, 0x90); //0x24 * 4
  token.writeUInt32LE(upgrades[1], 0x94); //0x25 * 4
  token.writeUInt16BE(1, 0x98); //0x26 * 4 //Page 26 is used for verification of somekind.
  return token;
}

//Create a token JSON object from provided character data
function createCharacter(id, uid) {
  const token = Buffer.alloc(180); // Game really only cares about 0x26 being 0 and D4 returning an ID

  token.uid = uid;
  token.id = id;
  return token;
}

//This function retrieves the name of a vehicle/gadget from an id
function getTokenNameFromID(id) {
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
function getCharacterNameFromID(id) {
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
function getAnyNameFromID(id) {
  if (id < 1000) {
    return getTokenNameFromID(id);
  }
  return getCharacterNameFromID(id);
}

//This finds and returns an JSON entry from toytags.json with the matching uid.
function getJSONFromUID(uid) {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const dataset = JSON.parse(data);

  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];

    if (entry.uid == uid) {
      return entry;
    }
  }
  return undefined;
}

//This updates the pad index of a tag in toytags.json, so that info can be accessed locally.
function updatePadIndex(uid, index) {
  console.log("Planning to set UID: " + uid + " to index " + index);
  const data = fs.readFileSync(toytagsPath, "utf8");
  const dataset = JSON.parse(data);

  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];

    if (entry.uid == uid) {
      entry.index = index;
      break;
    }
  }

  fs.writeFile(toytagsPath, JSON.stringify(dataset, null, 4));
  console.log("Set UID: " + uid + " to index " + index);
}

//This searches toytags.json and returns to UID of the entry with the matching index.
function getUIDFromIndex(index) {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const dataset = JSON.parse(data);
  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];

    if (entry.index == index) {
      return entry.uid;
    }
  }
  return undefined;
}

//This updates the provided datatype, of the entry with the matching uid, with the provided data.
function writeJSONData(uid, datatype, value) {
  console.log("Planning to set " + datatype + " of " + uid + " to " + value);
  const tags = fs.readFileSync(toytagsPath, "utf8");
  const dataset = JSON.parse(tags);

  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];

    if (entry.uid == uid) {
      entry[datatype] = value;
      break;
    }
  }

  fs.writeFileSync(toytagsPath, JSON.stringify(dataset, null, 4));
  console.log(`Updated [${datatype}] of [${uid}] to [${value}]`);
}

function writeJSONBundle(uid, bundle) {
  console.log(`Planning to write bundle of length ${bundle.length} to ${uid}`);
  const tags = fs.readFileSync(toytagsPath, "utf8");
  const dataset = JSON.parse(tags);

  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];

    if (entry.uid == uid) {
      bundle.forEach((data) => {
        entry[data.key] = data.value;
      });
      break;
    }
  }

  fs.writeFileSync(toytagsPath, JSON.stringify(dataset, null, 4));
  console.log(`Wrote bundle to toytags.json`);
}

//This sets all saved index values to '-1' (meaning unplaced).
function initializeToyTagsJSON() {
  const data = fs.readFileSync(toytagsPath, "utf8");
  const dataset = JSON.parse(data);
  dataset.forEach((db) => {
    db.index = "-1";
  });
  fs.writeFileSync(toytagsPath, JSON.stringify(dataset, null, 4));
  console.log("Initialized toytags.JSON");
  io.emit("refreshTokens");
}

function RGBToHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;
  let hex = "#" + r + g + b;

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
    case "#000018":
      return "#0000ff"; //blue
    case "#ff0018":
      return "#ff00ff"; //pink

    //wyldstyle scanner
    case "#f00016":
      return "#ff2de6";

    //batman stealth
    case "#000018":
      return "#0000ff";

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
    //case "#f00000":
    //return "#ff0000";
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

function getUIDAtPad(index) {
  const token = tp._tokens.find((t) => t.index === index);
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
 * **When writing the pages requested for the write are sometimes ofset by 12, not sure why.
 *
 * This data is copied to the JSON for future use.
 */
tp.hook(tp.CMD_WRITE, (req, res) => {
  const ind = req.payload[0];
  const page = req.payload[1];
  const data = req.payload.slice(2);
  const uid = getUIDFromIndex(ind);
  console.log("REQUEST (CMD_WRITE): index:", ind, "page", page, "data", data);

  //The ID is stored in page 24
  if (page == 24 || page == 36) {
    const id = data.readInt16LE(0);
    const name = getAnyNameFromID(id);

    writeJSONBundle(uid, [
      { key: "id", value: id },
      { key: "name", value: name },
      { key: "type", value: "vehicle" },
    ]);
    //writeVehicleData(uid, "uid", tp.randomUID())
  }
  //Vehicle uprades are stored in Pages 23 & 25
  else if (page == 23 || page == 35)
    writeJSONData(uid, "vehicleUpgradesP23", data.readUInt32LE(0));
  else if (page == 25 || page == 37) {
    writeJSONData(uid, "vehicleUpgradesP25", data.readUInt32LE(0));
    io.emit("refreshTokens"); //Refreshes the html's tag gui.
  }

  res.payload = Buffer.from([0x00]);
  const token = tp._tokens.find((t) => t.index == ind);
  if (token) {
    req.payload.copy(token.token, 4 * page, 2, 6);
  }
});

//Colors
tp.hook(tp.CMD_COL, (req, res) => {
  console.log("    => CMD_COL");
  console.log("    => pad:", req.payload[0]);
  console.log("    => red:", req.payload[1]);
  console.log("    => green:", req.payload[2]);
  console.log("    => blue:", req.payload[3]);
  const pad_number = req.payload[0];
  const pad_color = RGBToHex(req.payload[1], req.payload[2], req.payload[3]);
  if (pad_number == 0) io.emit("Color All", [pad_color, pad_color, pad_color]);
  else io.emit("Color One", [pad_number, pad_color]);
});

tp.hook(tp.CMD_FADE, (req, res) => {
  const pad_number = req.payload[0];
  const pad_speed = req.payload[1];
  const pad_cycles = req.payload[2];
  const pad_color = RGBToHex(req.payload[3], req.payload[4], req.payload[5]);
  io.emit("Fade One", [pad_number, pad_speed, pad_cycles, pad_color]);
});

///NOT IMPLEMENTED///
tp.hook(tp.CMD_FLASH, (req, res) => {
  console.log("    => CMD_FLASH");
  console.log("    => pad:", req.payload[0]);
  console.log("    => color duration:", req.payload[1]);
  console.log("    => white duration:", req.payload[2]);
  console.log("    => cycles:", req.payload[3]);
  console.log("    => red:", req.payload[4]);
  console.log("    => green:", req.payload[5]);
  console.log("    => blue:", req.payload[6]);
});

///NOT IMPLEMENTED///
tp.hook(tp.CMD_FADRD, (req, res) => {
  console.log("    => CMD_FADRD - pad:", req.payload[0]);
  console.log("    => speed:", req.payload[1]);
  console.log("    => cycles:", req.payload[2]);
});

tp.hook(tp.CMD_FADAL, (req, res) => {
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

  io.emit("Fade All", [
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
  // setTimeout(function(){io.emit("Fade All",
  // 					[top_pad_speed, top_pad_cycles, 'white',
  // 					 left_pad_speed, left_pad_cycles, 'white',
  // 					 right_pad_speed, right_pad_cycles, 'white'])}, 2500);
});

///NOT IMPLEMENTED///
tp.hook(tp.CMD_FLSAL, (req, res) => {
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
});

tp.hook(tp.CMD_COLALL, (req, res) => {
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

  io.emit("Color All", [top_pad_color, left_pad_color, right_pad_color]);
});

///DEBUG PURPOSES///
tp.hook(tp.CMD_GETCOL, (req, res) => {
  console.log("    => CMD_GETCOL");
  console.log("    => pad:", req.payload[0]);
});

tp.hook(tp.CMD_WAKE, (req, res) => {
  isConnectedToGame = true;
  io.emit("Connection True");
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "server")));

//**Website requests**//
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "server/index.html"));
});

//Create a new Character and save that data to toytags.json
app.post("/character", (req, res) => {
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

  fs.readFile(toytagsPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const tags = JSON.parse(data);

      tags.push({
        name: name,
        id: id,
        uid: character.uid,
        index: "-1",
        type: "character",
        vehicleUpgradesP23: 0,
        vehicleUpgradesP25: 0,
      });

      fs.writeFile(
        toytagsPath,
        JSON.stringify(tags, null, 4),
        "utf8",
        (err) => {
          if (err) {
            console.log(`Error writing file: ${err}`);
          } else {
            console.log(`File is written successfully!`);
          }
        }
      );
    }
  });

  console.log("Character created: " + req.body.id);
  res.send();
});

//This is called when a token is placed or move onto a position on the toypad.
app.post("/place", (request, response) => {
  console.log("Placing tag: " + request.body.id);
  const entry = getJSONFromUID(request.body.uid);

  //console.log(entry.type);

  if (entry.type == "character") {
    const character = createCharacter(request.body.id, request.body.uid);
    tp.place(
      character,
      request.body.position,
      request.body.index,
      character.uid
    );
    console.log("Character tag: " + request.body.id);
    updatePadIndex(character.uid, request.body.index);
    response.send();
  } else {
    const vehicle = createVehicle(request.body.id, request.body.uid, [
      entry.vehicleUpgradesP23,
      entry.vehicleUpgradesP25,
    ]);
    tp.place(vehicle, request.body.position, request.body.index, vehicle.uid);
    console.log("Vehicle tag: " + request.body.id);
    updatePadIndex(vehicle.uid, request.body.index);
    response.send();
  }
});

app.post("/vehicle", (request, response) => {
  const id = request.body.id;
  const uid = tp.randomUID();
  console.log("Creating vehicle: " + request.body.id);
  const vehicle = createVehicle(id, uid, [0xefffffff, 0xefffffff]);
  const name = getTokenNameFromID(id);

  console.log("name: " + name, " uid: " + vehicle.uid, " id: " + vehicle.id);

  fs.readFile(toytagsPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const tags = JSON.parse(data.toString());
      const entry = {
        name: name,
        id: id,
        uid: vehicle.uid,
        index: "-1",
        type: "vehicle",
        vehicleUpgradesP23: 0xefffffff,
        vehicleUpgradesP25: 0xefffffff,
      };

      console.log(entry);
      tags.push(entry);

      fs.writeFile(
        toytagsPath,
        JSON.stringify(tags, null, 4),
        "utf8",
        (err) => {
          if (err) {
            console.log(`Error writing file: ${err}`);
          } else {
            console.log(`File is written successfully!`);
          }
        }
      );
    }
  });
  console.log("Vehicle placed: " + request.body.id);
  response.send(uid);
});

//This is called when a token needs to be removed from the pad.
app.delete("/remove", (request, response) => {
  console.log("Removing item: " + request.body.index);
  // console.log('DEBUG: pad-from-token: ', tp._tokens.filter(v => v.index == request.body.index)[0].pad);
  tp.remove(request.body.index);
  console.log("Item removed: " + request.body.index);
  updatePadIndex(request.body.uid, "-1");
  response.send(true);
});

//**IO CALLS**//
//This setups the IO connection between index.js and index.html.
io.on("connection", (socket) => {
  //Listening for 'deleteToken' call from index.html
  socket.on("deleteToken", (uid) => {
    console.log("IO Recieved: Deleting entry " + uid + " from JSON");
    const tags = fs.readFileSync(toytagsPath, "utf8");
    const dataset = JSON.parse(tags);
    let index = -1;

    for (let i = 0; i < dataset.length; i++) {
      const entry = dataset[i];

      if (entry.uid == uid) {
        index = i;
        break;
      }
    }

    console.log("Entry to delete: ", index);
    if (index === -1) {
      console.log("Token 404.");
      return;
    }
	  
    dataset.splice(index, 1);
    fs.writeFile(toytagsPath, JSON.stringify(dataset, null, 4), (err) => {
      if (err) {
        console.log("Failed to write updated data to toytags.json: " + err);
        return;
      }

      io.emit("refreshTokens");
      console.log(`Succesfully deleted ${uid} from toytags.json `);
    });
  });

  socket.on("connectionStatus", () => {
    if (isConnectedToGame == true) {
      io.emit("Connection True");
    }
  });

  socket.on("syncToyPad", (pad) => {
    console.log("<<Syncing tags, one moment...>>");
    initializeToyTagsJSON();
    for (let i = 1; i <= 7; i++) {
      const uid = getUIDAtPad(i);
      if (uid != -1) {
        //console.log(uid, "is at pad #", i);
        writeJSONData(uid, "index", i);
      }
    }
    io.emit("refreshTokens");
    console.log("<<Tags are synced!>>");
  });
});

server.listen(80, () => console.log("Server running on port 80"));
