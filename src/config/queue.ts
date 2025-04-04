import { Queue } from "bullmq";
import { config } from "dotenv"; config();
import Redis from "ioredis";

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379)
});

export const videoQueue = new Queue("video-processing", {
    connection: redisConnection
});

