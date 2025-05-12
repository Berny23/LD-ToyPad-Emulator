"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const character_routes_1 = __importDefault(require("./routes/character.routes"));
const placement_routes_1 = __importDefault(require("./routes/placement.routes"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes"));
const token_routes_1 = __importDefault(require("./routes/token.routes"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "../", "public")));
app.patch("/tokens/:uid/place", placement_routes_1.default);
app.post("/tokens/character", character_routes_1.default);
app.post("/tokens/vehicle", vehicle_routes_1.default);
app.delete("/tokens/:uid", token_routes_1.default);
exports.default = app;
