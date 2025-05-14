import characterRoutes from "./routes/character.routes";
import placementRoutes from "./routes/placement.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import tokenRoutes from "./routes/token.routes";
import imageRoutes from "./routes/images.routes";
import express from "express";
import path from "path";

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../", "public")));

app.get("/images/:img", imageRoutes);

app.patch("/tokens/:uid/place", placementRoutes);
app.post("/tokens/character", characterRoutes);
app.post("/tokens/vehicle", vehicleRoutes);
app.delete("/tokens/:uid", tokenRoutes);

export default app;
