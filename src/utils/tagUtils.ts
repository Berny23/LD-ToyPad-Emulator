import fs from "fs";
import path from "path";
import { CharacterBuffer } from "src/interfaces/CharacterBuffer";
import { VehicleBuffer } from "src/interfaces/VehicleBuffer";

const characterMapPath = path.join("public/json/charactermap.json");
const tokenmapPath = path.join("public/json/tokenmap.json");

/* Vehicle Data Explained:
 * All data is transfered through a series of buffers. The data from these buffers needs to written to specific points (pages) in the token's
 * buffer for it to be read properly.
 *
 * For vehicles:
 * Page 24 is the ID of the vehicle
 * Pages 23 & 25 are the upgrade data
 */

export function createVehicle(
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
export function createCharacter(id: number, uid: string): CharacterBuffer {
  const token: any = Buffer.alloc(180); // Game really only cares about 0x26 being 0 and D4 returning an ID

  token.uid = uid;
  token.id = id;
  return token;
}
//This function retrieves the name of a vehicle/gadget from an id
export function getTokenNameFromID(id: number) {
  const data = fs.readFileSync(tokenmapPath, "utf8");
  const dataset = JSON.parse(data);

  let entry;
  for (let i = 0; i < dataset.length; i++) {
    entry = dataset[i];

    if (entry.id == id) {
      return entry.name;
    }
  }

  return "N/A";
}
//This function retrieves the name of a character  from an id
export function getCharacterNameFromID(id: number) {
  const data = fs.readFileSync(characterMapPath, "utf8");
  const dataset = JSON.parse(data);

  let entry;
  for (let i = 0; i < dataset.length; i++) {
    entry = dataset[i];

    if (entry.id == id) {
      return entry.name;
    }
  }

  return "N/A";
}
//This function retrieves the name of a token by id
export function getAnyNameFromID(id: number) {
  if (id < 1000) {
    return getTokenNameFromID(id);
  }
  return getCharacterNameFromID(id);
}
