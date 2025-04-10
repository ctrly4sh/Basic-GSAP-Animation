import express from "express";
import * as uploadController from "../controllers/uploadController";
import multer from "multer";
import fs from "fs";
import path from "path";
import moment from "moment";
import { randomUUID } from "crypto";

const router = express.Router();

router.get('/health', uploadController.health);

// Multer middleware for handling file upload
const uploadDirectory = path.join(__dirname, 'uploads');
console.log(`Dirname -- ${__dirname}`);

if (!fs.existsSync(uploadDirectory)) fs.mkdirSync(uploadDirectory);

const multerMiddlewareConfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (req, file, callback) => {
        if (!file || !file.originalname) {
            console.error("File or originalname is undefined");
            return callback(new Error("Invalid file upload"), "");
        }
        const timestamp = moment().format("YYYYMMDD_HHmmss");
        const uniqueSuffix = `${timestamp}_${randomUUID()}`;
        const fileName = `${uniqueSuffix}_${file.originalname}`;
        console.log("Generated Filename: ", fileName);
        callback(null, fileName);
    }
});

const multerMiddleware = multer({ storage: multerMiddlewareConfig });

router.post('/upload', multerMiddleware.single("video"), uploadController.postVideo)

export default router;