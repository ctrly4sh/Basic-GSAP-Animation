import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import { Request, Response } from 'express';
import mkdirp from "mkdirp";


export const health = (req: Request, res: Response) => {
  res.status(200).send({success: true, message: "Server health okay"})
  return
};

export const postVideo = async(req: Request, res: Response): Promise<void> => {

  try {

    const video = req.file;
    const name = req.body.name;

    const videoMetaData = {
      name: `${video?.originalname} ${name}`,
      path: video?.path,
      type: video?.mimetype
    };   

    const videoId = uuidv4();
    const baseOutputDir = path.join(__dirname, "..", "uploads", videoId);
    mkdirp.sync(baseOutputDir);

    const inputPath = video?.path;

    const resolutions = {
      '144p': { width: 256, height: 144, bitrate: '300k' },
      '240p': { width: 426, height: 240, bitrate: '500k' },
      '360p': { width: 640, height: 360, bitrate: '1000k' },
      '480p': { width: 854, height: 480, bitrate: '2000k' },
      '720p': { width: 1280, height: 720, bitrate: '4000k' },
      '1080p': { width: 1920, height: 1080, bitrate: '8000k' },
    };

    const conversionProcess = Object.entries(resolutions).map(([label, config]) => {
      const resolutionDir = path.join(baseOutputDir, `${label}.mp4`);
      mkdirp.sync(resolutionDir);

      return new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .size(`${config.width}x${config.height}`)
          .videoBitrate(config.bitrate)
          .format('hls')
          .outputOptions([
            "-preset veryfast",
            "-g 48",
            "-sc_threshold 0",
            "-c:a aac",
            "-ar 48000",
            "-b:a 128k",
            "-hls_time 5",
            "-hls_playlist_type vod",
            `-hls_segment_filename ${path.join(resolutionDir, "segment%d.ts")}`
          ])
          .output(path.join(resolutionDir, "index.m3u8"))
          .on('end', () => {
            console.log(`✅ ${label} conversion done`);
            resolve();
          })
          .on('error', (err) => {
            console.error(`❌ Error converting to ${label}:`, err.message);
            reject(err);
          })
          .run();
      });
    });

    res.status(200).send({
      success: true, 
      data: videoMetaData,
      message: "Videos uploaded and HLS stream generated",
      videoId: videoId,
      resolutions: Object.keys(resolutions)
    })
 
  }catch(error: any) {
    console.log("Error uploading file ", error)
  }

};
