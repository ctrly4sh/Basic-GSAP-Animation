import {Router} from "express"
import { getStreamData } from "../controllers/streamController";

const router = Router();

router.get('/stream', getStreamData);

export default router;