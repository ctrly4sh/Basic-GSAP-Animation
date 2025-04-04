import { Worker, Job } from "bullmq";
import { config } from "dotenv"; config()
import Redis from "ioredis";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";
import s3 from "../config/aws"
import { PutObjectCommand } from "@aws-sdk/client-s3";


const redisConection = new Redis({})