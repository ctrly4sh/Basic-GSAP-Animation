import express from "express"
import * as uploadController from "../controllers/uploadController"
import {upload, uploadToS3 } from "../config/multer";


const router = express.Router();

router.get('/health', uploadController.health)
router.post('/upload', upload.single("file"), uploadToS3)

export default router;