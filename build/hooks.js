"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hook = hook;
const bridge_1 = require("./bridge");
const conversion_1 = require("./utils/conversion");
const tagUtils_1 = require("./utils/tagUtils");
const toytags_1 = require("./utils/toytags");
function hook() {
    bridge_1.tp.hook(bridge_1.tp.CMD_WRITE, handleWriteCommand);
    //Colors
    bridge_1.tp.hook(bridge_1.tp.CMD_COL, handleColorCommand);
    bridge_1.tp.hook(bridge_1.tp.CMD_FADE, handleFadeCommand);
    ///NOT IMPLEMENTED///
    bridge_1.tp.hook(bridge_1.tp.CMD_FLASH, handleFlashCommand);
    bridge_1.tp.hook(bridge_1.tp.CMD_FADRD, handleFadeRandomCommand);
    bridge_1.tp.hook(bridge_1.tp.CMD_FADAL, handleFadeAllCommand);
    bridge_1.tp.hook(bridge_1.tp.CMD_FLSAL, handleFlashAllCommand);
    bridge_1.tp.hook(bridge_1.tp.CMD_COLALL, handleColorAllCommand);
    ///DEBUG PURPOSES///
    bridge_1.tp.hook(bridge_1.tp.CMD_GETCOL, handleGetColorCommand);
    bridge_1.tp.hook(bridge_1.tp.CMD_WAKE, handleWakeCommand);
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
function handleWriteCommand(req, res) {
    const ind = req.payload[0];
    const page = req.payload[1];
    const data = req.payload.slice(2);
    const uid = (0, toytags_1.select)("index", ind)?.uid;
    if (!uid)
        return;
    console.log("REQUEST (CMD_WRITE): index:", ind, "page", page, "data", data);
    //The ID is stored in page 24
    if (page == 24 || page == 36) {
        const id = data.readInt16LE(0);
        const name = (0, tagUtils_1.getAnyNameFromID)(id);
        (0, toytags_1.updateKeys)(uid, [
            { key: "id", value: id },
            { key: "name", value: name },
            { key: "type", value: "vehicle" },
        ]);
        //writeVehicleData(uid, "uid", tp.randomUID())
    }
    //Vehicle uprades are stored in Pages 23 & 25
    else if (page == 23 || page == 35)
        (0, toytags_1.updateKey)(uid, "vehicleUpgradesP23", data.readUInt32LE(0));
    else if (page == 25 || page == 37) {
        (0, toytags_1.updateKey)(uid, "vehicleUpgradesP25", data.readUInt32LE(0));
        bridge_1.io.emit(Emits.Refresh);
    }
    res.payload = Buffer.from([0x00]);
    const token = bridge_1.tp._tokens.find((t) => t.index == ind);
    if (token) {
        req.payload.copy(token.token, 4 * page, 2, 6);
    }
}
function handleColorCommand(req, res) {
    console.log("    => CMD_COL");
    console.log("    => pad:", req.payload[0]);
    console.log("    => red:", req.payload[1]);
    console.log("    => green:", req.payload[2]);
    console.log("    => blue:", req.payload[3]);
    const pad_number = req.payload[0];
    const pad_color = (0, conversion_1.RGBToHex)(req.payload[1], req.payload[2], req.payload[3]);
    if (pad_number == 0)
        bridge_1.io.emit(Emits.ColorAll, [pad_color, pad_color, pad_color]);
    else
        bridge_1.io.emit(Emits.ColorOne, [pad_number, pad_color]);
}
function handleFadeCommand(req, res) {
    const pad_number = req.payload[0];
    const pad_speed = req.payload[1];
    const pad_cycles = req.payload[2];
    const pad_color = (0, conversion_1.RGBToHex)(req.payload[3], req.payload[4], req.payload[5]);
    bridge_1.io.emit(Emits.FadeOne, [pad_number, pad_speed, pad_cycles, pad_color]);
}
function handleFlashCommand(req, res) {
    console.log("    => CMD_FLASH");
    console.log("    => pad:", req.payload[0]);
    console.log("    => color duration:", req.payload[1]);
    console.log("    => white duration:", req.payload[2]);
    console.log("    => cycles:", req.payload[3]);
    console.log("    => red:", req.payload[4]);
    console.log("    => green:", req.payload[5]);
    console.log("    => blue:", req.payload[6]);
}
function handleFadeRandomCommand(req, res) {
    console.log("    => CMD_FADRD - pad:", req.payload[0]);
    console.log("    => speed:", req.payload[1]);
    console.log("    => cycles:", req.payload[2]);
}
function handleFadeAllCommand(req, res) {
    const top_pad_speed = req.payload[1];
    const top_pad_cycles = req.payload[2];
    const top_pad_color = (0, conversion_1.RGBToHex)(req.payload[3], req.payload[4], req.payload[5]);
    const left_pad_speed = req.payload[7];
    const left_pad_cycles = req.payload[8];
    const left_pad_color = (0, conversion_1.RGBToHex)(req.payload[9], req.payload[10], req.payload[11]);
    const right_pad_speed = req.payload[13];
    const right_pad_cycles = req.payload[14];
    const right_pad_color = (0, conversion_1.RGBToHex)(req.payload[15], req.payload[16], req.payload[17]);
    bridge_1.io.emit(Emits.FadeAll, [
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
function handleFlashAllCommand(req, res) {
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
function handleColorAllCommand(req, res) {
    console.log("    => CMD_COLAL");
    const top_pad_color = (0, conversion_1.RGBToHex)(req.payload[1], req.payload[2], req.payload[3]);
    const left_pad_color = (0, conversion_1.RGBToHex)(req.payload[5], req.payload[6], req.payload[7]);
    const right_pad_color = (0, conversion_1.RGBToHex)(req.payload[9], req.payload[10], req.payload[11]);
    bridge_1.io.emit(Emits.ColorAll, [top_pad_color, left_pad_color, right_pad_color]);
}
function handleGetColorCommand(req, res) {
    console.log("    => CMD_GETCOL");
    console.log("    => pad:", req.payload[0]);
}
function handleWakeCommand(req, res) {
    (0, bridge_1.setConnectionStatus)(true);
    bridge_1.io.emit(Emits.ConnectionAffirmation);
}
