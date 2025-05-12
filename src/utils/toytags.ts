const fs = require("fs");
const path = require("path");

const toytagsPath = path.join("public/json/toytags.json");

//This updates the provided datatype, of the entry with the matching uid, with the provided data.
export function updateKey(
  uid: string,
  datatype: keyof Toytag,
  value: Toytag[keyof Toytag]
) {
  const data = internal_get();

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    if (entry.uid == uid) {
      entry[datatype] = value;
      break;
    }
  }

  internal_write(data);
}

export function updateKeys(
  uid: string,
  bundle: { key: string; value: string }[]
) {
  const data = internal_get();

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    if (entry.uid == uid) {
      bundle.forEach((data) => {
        entry[data.key] = data.value;
      });
      break;
    }
  }

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
    entry.index = "-1";
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
function internal_get() {
  const rawData = fs.readFileSync(toytagsPath, "utf8");

  return JSON.parse(rawData);
}
function internal_write(data: Toytag) {
  if (typeof data !== "object") {
    data = JSON.parse(data);
  } else if (typeof data !== "string") return;

  fs.writeFileSync(toytagsPath, data);
}
