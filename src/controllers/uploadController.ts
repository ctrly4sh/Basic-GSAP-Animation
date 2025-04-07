import { Upload } from "@aws-sdk/lib-storage";
import { error } from "console";
import mkdirp from "mkdirp";
import express, { Request, Response } from "express";
import path, { dirname } from "path";
import {v4} from "uuid";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg"

export const health = (req: Request, res: Response) => {
  try {
    res.status(200).send({ success: true, message: "Upload API Health okay" });
    return;
  } catch (error: any) {}
};

// export const postVideo = async (req: Request, res: Response) => {
//   try {
//     const video = req.file;

//     if (!video) {
//       res.status(400).send({ success: false, message: "No file found" });
//       return;
//     }

//     const videoId = v4();
//     const inputPath = video.path
//     const baseOutputPath = path.join(__dirname, "..", "uploads", videoId);
    
//     fs.mkdirSync(baseOutputPath);
//     fs.copyFileSync(inputPath, path.join(baseOutputPath, video.originalname));

//     const resolutions = {
//       "144p": { width: 256, height: 144, bitrate: "300k" },
//       "240p": { width: 426, height: 240, bitrate: "500k" },
//       // "480p": { width: 854, height: 480, bitrate: "1000k" },
//       // "720p": { width: 1280, height: 720, bitrate: "2500k" },
//     };
    
//     console.log("Video encoding is started ........")

//     for (const [label, { width, height, bitrate }] of Object.entries(resolutions)) {
//       const outputDir = path.join(baseOutputPath, label);
//       mkdirp.sync(outputDir);

//       await new Promise<void>((resolve, reject) => {
//         ffmpeg(inputPath)
//           .addOptions([
//             `-vf scale=${width}:${height}`,
//             `-c:a aac`,
//             `-ar 48000`,
//             `-b:a 128k`,
//             `-c:v h264`,
//             `-profile:v main`,
//             `-crf 20`,
//             `-g 48`,
//             `-keyint_min 48`,
//             `-sc_threshold 0`,
//             `-b:v ${bitrate}`,
//             `-maxrate ${bitrate}`,
//             `-bufsize 1000k`,
//             `-hls_time 5`,
//             `-hls_playlist_type vod`,
//             `-hls_segment_filename ${path.join(outputDir, 'segment%d.ts')}`,
//           ])
//           .output(path.join(outputDir, 'index.m3u8'))
//           .on('end', () => {
//             console.log(`✅ ${label} processing done`);
//             resolve();
//           })
//           .on('error', (err: any) => {
//             console.error(`❌ Error processing ${label}: ${err.message}`);
//             reject(err);
//           })
//           .run();
//       });
//     }

//     console.log("Video encoding is done ........")

//     res.status(200).send({
//       success: true,
//       message: "Video uploaded and processed successfully!",
//       videoId,
//       storagePath: `/uploads/${videoId}/`, // relative path
//     });
//   } catch (err: any) {
//     console.error(`❌ Upload Error: ${err.message}`);
//     res.status(500).send({ success: false, message: "Internal server error" });
//   }
// };

export const postVideo = async (req: Request, res: Response) => {
  let video: Express.Multer.File | undefined;
  try {
    video = req.file;

    if (!video) {
      res.status(400).send({ success: false, message: "No file found" });
      return;
    }

    const videoId = v4();
    const inputPath = video.path;
    const baseOutputPath = path.join(process.cwd(), "uploads", videoId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(baseOutputPath)) {
      fs.mkdirSync(baseOutputPath, { recursive: true });
    }

    // Copy original file
    const originalFilePath = path.join(baseOutputPath, video.originalname);
    fs.copyFileSync(inputPath, originalFilePath);

    // Clean up the temp file
    fs.unlinkSync(inputPath);

    const resolutions = {
      "144p": { width: 256, height: 144, bitrate: "300k" },
      "240p": { width: 426, height: 240, bitrate: "500k" },
    };
    
    console.log("Video encoding started...");

    // Process each resolution
    for (const [label, { width, height, bitrate }] of Object.entries(resolutions)) {
      const outputDir = path.join(baseOutputPath, label);
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      await new Promise<void>((resolve, reject) => {
        ffmpeg(originalFilePath)  // Use the copied file instead of temp file
          .addOptions([
            `-vf scale=${width}:${height}`,
            `-c:a aac`,
            `-ar 48000`,
            `-b:a 128k`,
            `-c:v h264`,
            `-profile:v main`,
            `-crf 20`,
            `-g 48`,
            `-keyint_min 48`,
            `-sc_threshold 0`,
            `-b:v ${bitrate}`,
            `-maxrate ${bitrate}`,
            `-bufsize 1000k`,
            `-hls_time 5`,
            `-hls_playlist_type vod`,
            `-hls_segment_filename ${path.join(outputDir, 'segment%d.ts')}`,
          ])
          .output(path.join(outputDir, 'index.m3u8'))
          .on('end', () => {
            console.log(`✅ ${label} processing done`);
            resolve();
          })
          .on('error', (err: any) => {
            console.error(`❌ Error processing ${label}: ${err.message}`);
            reject(err);
          })
          .run();
      });
    }

    console.log("Video encoding completed");

    res.status(200).send({
      success: true,
      message: "Video uploaded and processed successfully!",
      videoId,
      storagePath: `/uploads/${videoId}/`,
    });

  } catch (err: any) {
    console.error(`❌ Upload Error: ${err.message}`);
    
    // Clean up if something went wrong
    if (video?.path && fs.existsSync(video.path)) {
      fs.unlinkSync(video.path);
    }
    
    res.status(500).send({ 
      success: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};