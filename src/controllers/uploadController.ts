import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export const postVideo = async (req: Request, res: Response): Promise<void> => {
  const prisma = new PrismaClient();

  const s3client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  });

  try {
    const video = req.file;
    const videoTitle = req.body.title;

    if (!video) throw new Error("Video file is missing");

    const tempDir = path.join(process.cwd(), "hls_temp", randomUUID());

    console.log(`Temp Dir : ${tempDir}`);

    fs.mkdirSync(tempDir, { recursive: true });

    const resolutions = [
      { name: "360p", width: 640, height: 360, bitrate: "800k" },
      { name: "480p", width: 854, height: 480, bitrate: "1400k" },
      { name: "720p", width: 1280, height: 720, bitrate: "2800k" },
    ];

    const variantPlaylists = [];

    // Generate HLS for each resolution
    for (const res of resolutions) {
      const outputDir = path.join(tempDir, res.name);
      fs.mkdirSync(outputDir, { recursive: true });

      await new Promise((resolve, reject) => {
        ffmpeg(video.path)
          .outputOptions([
            "-preset veryfast",
            `-s ${res.width}x${res.height}`,
            `-b:v ${res.bitrate}`,
            "-hls_time 10",
            "-hls_list_size 0",
            "-f hls",
          ])
          .output(path.join(outputDir, "index.m3u8"))
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      variantPlaylists.push({
        resolution: `${res.width}x${res.height}`,
        bandwidth: parseInt(res.bitrate),
        uri: `${res.name}/index.m3u8`,
      });
    }

    // Create master.m3u8
    const masterPlaylist = variantPlaylists
      .map(
        (variant) =>
          `#EXT-X-STREAM-INF:BANDWIDTH=${variant.bandwidth},RESOLUTION=${variant.resolution}\n${variant.uri}`
      )
      .join("\n");

    fs.writeFileSync(path.join(tempDir, "master.m3u8"), masterPlaylist);

    // Upload all files to S3
    const uploadDirToS3 = async (dirPath: string, s3Prefix: string) => {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          await uploadDirToS3(fullPath, `${s3Prefix}/${file}`);
        } else {
          const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `hls/${s3Prefix}/${file}`,
            Body: fs.createReadStream(fullPath),
            ContentType: file.endsWith(".m3u8")
              ? "application/vnd.apple.mpegurl"
              : "video/MP2T",
          };
          await s3client.send(new PutObjectCommand(uploadParams));
        }
      }
    };

    const uuid = randomUUID();
    await uploadDirToS3(tempDir, uuid);

    const masterM3U8Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/hls/${uuid}/master.m3u8`;

    const metaData = await prisma.metaData.create({
      data: {
        fileUrl: masterM3U8Url,
        format: "hls",
        size: video.size,
        title: videoTitle,
      },
    });

    // Cleanup temp files
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(video.path, { force: true });

    res.status(200).send({ success: true, metaData });
  } catch (error: any) {
    console.error("Error uploading and processing video:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to upload/process video" });
  }
};
