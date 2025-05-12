const fs = require("fs");
const path = require("path");

const toytagsPath = path.join(__dirname, "server/json/toytags.json");

//This searches toytags.json and returns to UID of the entry with the matching index.
export function getUIDFromIndex(index: number) {
  const data = internal_get();
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    if (entry.index == index) {
      return entry.uid;
    }
  }
}

export function getEntryFromUID(uid: string) {
  const data = internal_get();

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    if (entry.uid == uid) {
      return entry;
    }
  }
}
//This updates the pad index of a tag in toytags.json, so that info can be accessed locally.
export function updatePadIndex(uid: string, index: number) {
  const data = internal_get();

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    if (entry.uid == uid) {
      entry.index = index;
      break;
    }
  }

  internal_write(data);
}
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
  bundle: [{ key: keyof Toytag; value: Toytag[keyof Toytag] }]
) {
  const data = internal_get();

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    if (entry.uid == uid) {
      bundle.forEach(
        (data: { key: keyof Toytag; value: Toytag[keyof Toytag] }) => {
          entry[data.key] = data.value;
        }
      );
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
export function deleteByUID(uid: string) {
  const data = internal_get();

  for (let i = 0; i < data.length; i++) {
    if (data[i].uid == uid) {
      data.splice(i, 1);
      break;
    }
  }
  internal_write(data);
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
