"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVehicle = createVehicle;
exports.createCharacter = createCharacter;
exports.getTokenNameFromID = getTokenNameFromID;
exports.getCharacterNameFromID = getCharacterNameFromID;
exports.getAnyNameFromID = getAnyNameFromID;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const charactersMapPath = path_1.default.join(__dirname, "server/json/charactersmap.json");
const tokenmapPath = path_1.default.join(__dirname, "server/json/tokenmap.json");
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
    token.writeUInt32LE(upgrades[0], 0x8c); //0x23 * 4
    token.writeUInt16LE(id, 0x90); //0x24 * 4
    token.writeUInt32LE(upgrades[1], 0x94); //0x25 * 4
    token.writeUInt16BE(1, 0x98); //0x26 * 4 Page 26 is used for verification of somekind.
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
    const data = fs_1.default.readFileSync(tokenmapPath, "utf8");
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
    const data = fs_1.default.readFileSync(charactersMapPath, "utf8");
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
