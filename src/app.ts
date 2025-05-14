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

app.use("/images/:img", imageRoutes);
app.use("/tokens/:uid/place", placementRoutes);
app.use("/tokens/character", characterRoutes);
app.use("/tokens/vehicle", vehicleRoutes);
app.use("/tokens/:uid", tokenRoutes);

export default app;
