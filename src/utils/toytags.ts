import fs from "fs";
import path from "path";
import { Toytag } from "../interfaces/Toytag";

const toytagsPath = path.join("public/json/toytags.json");

//This updates the provided datatype, of the entry with the matching uid, with the provided data.
export function updateKey<K extends keyof Toytag>(
  uid: string,
  datatype: K,
  value: Toytag[K]
) {
  const data = internal_get();

  let entry;
  for (let i = 0; i < data.length; i++) {
    entry = data[i];

    if (entry.uid == uid) {
      entry[datatype] = value;
      break;
    }
  }

  internal_write(data);
}

export function updateKeys<K extends keyof Toytag>(
  uid: string,
  bundle: [K, Toytag[K]][]
) {
  const data = internal_get();

  let entry: Toytag | undefined;
  for (let i = 0; i < data.length; i++) {
    if (data[i].uid === uid) {
      entry = data[i];
      break;
    }
  }

  if (!entry) return;

  bundle.forEach(([key, value]) => {
    entry[key] = value;
  });

  internal_write(data);
}
export function addEntry(entry: Toytag) {
  if (typeof entry !== "object") return;

  const data = internal_get();
  data.push(entry);

  internal_write(data);
}
export function unplaceAll() {
  const data = internal_get();

  data.forEach((entry: Toytag) => {
    entry.index = -1;
  });

  internal_write(data);
}
export function deleteEntry(key: keyof Toytag, value: Toytag[keyof Toytag]) {
  const data = internal_get();

  let wasDeleted = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i][key] === value) {
      data.splice(i, 1);
      wasDeleted = true;
      break;
    }
  }
  if (wasDeleted) {
    internal_write(data);
    return true;
  }
  return false;
}
export function select(
  key: keyof Toytag,
  value: Toytag[keyof Toytag]
): Toytag | null {
  const data = internal_get();

  for (let i = 0; i < data.length; i++) {
    if (data[i][key] === value) {
      return data[i];
    }
  }
  return null;
}
//** Internal private calls */
function internal_get(): Toytag[] {
  const rawData = fs.readFileSync(toytagsPath, "utf8");

  return JSON.parse(rawData);
}
function internal_write(data: Toytag[] | string) {
  if (typeof data === "object") {
    data = JSON.stringify(data);
  }

  fs.writeFileSync(toytagsPath, data);
}
