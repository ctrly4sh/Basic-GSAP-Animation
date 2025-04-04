import { Request, Response } from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./aws";
import { config } from "dotenv";
import prisma from "./prisma";
config()

const bucketName = process.env.AWS_BUCKET_NAME as string;

const upload = multer({ storage: multer.memoryStorage() });

const uploadToS3 = async (req: Request, res: Response): Promise<void> => {

  let { title = Date.now()} = req.body;

  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return
  }

  const fileKey = `videos/${title}-${req.file.originalname}`

  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  try {
    
    const data = await s3.send(new PutObjectCommand(params));

    //file url
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    const savedMetaData = await prisma.metaData.create({
      data: {
        title: req.file.originalname,
        format: req.file.mimetype,
        size: req.file.size, 
        fileUrl
      }
    })


    res.status(200).send({message : "File uploaded successfully!", data: data});
    return
  
  } catch (error) {
    res.status(500).send({message: "Error uploading file" , data: error});
  }
};

export { upload, uploadToS3 };
