import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv'; config();
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from "fs";

export const health = (req: Request, res: Response) => {
  res.status(200).send({success: true, message: "Server health okay"})
  return
};

export const postVideo = async(req: Request, res: Response): Promise<void> => {
  
  const prisma = new PrismaClient();

  const s3client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!
  }
});

  try {

    const video = req.file;
    const videoTitle = req.body.title;


    // This is going to get saved in the Neon db Database
    
    const videoMetaData = {
      name: `${video?.originalname}`,
      path: video?.path,
      type: video?.mimetype,
      size: video?.size
    };   

    const s3Config = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `videos/${Date.now()}-${video?.originalname}`,
      Body: fs.createReadStream(video?.path as string ),
      ContentType: "video/mp4",
    };
    
    const s3Response = await s3client.send(new PutObjectCommand(s3Config))
    const fileS3Url = `https://${s3Config.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Config.Key}`;

    const metaData = await prisma.metaData.create({
      data: {
        fileUrl: fileS3Url,
        format: "mp4",
        size: videoMetaData.size as number,
        title: videoTitle
      }
    });
  

    res.status(200).send({
      success: true, 
      metaData
    })
 
  }catch(error: any) {
    console.error("Error uploading " , error.stack)
    res.status(500).send({success: false, message: "Error uploading video !"})
  }

};
