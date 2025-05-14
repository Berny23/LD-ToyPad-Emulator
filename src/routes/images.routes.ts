import fs from "fs";
import express, { Request, Response } from "express";
import path from "path";

const router = express.Router();
const folder = path.join(__dirname, "../../public/images/");
const supportedFileTypes = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];

router.get("/:img", (req: Request, res: Response) => {
  const img = req.params.img;

  if (!img || img.includes("..") || img.includes("/") || img.includes("\\")) {
    res.sendStatus(400);
    return;
  }

  const allImages = fs.readdirSync(folder);
  const foundImage = allImages.find((imgPath) => {
    const name = path.basename(imgPath, path.extname(imgPath)).toLowerCase();
    const ext = path.extname(imgPath).toLowerCase();
    return name === img.toLowerCase() && supportedFileTypes.includes(ext);
  });

  if (foundImage) {
    res.sendFile(path.join(folder, foundImage));
    return;
  }

  res.sendStatus(404);
});

export default router;
