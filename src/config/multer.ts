import { Request, Response } from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./aws";

const bucketName = process.env.AWS_BUCKET_NAME as string;

const upload = multer({ storage: multer.memoryStorage() });

const uploadToS3 = async (req: Request, res: Response): Promise<void> => {

  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return
  }

  const params = {
    Bucket: bucketName,
    Key: `videos/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    const data = await s3.send(new PutObjectCommand(params));
    res.status(200).send({message : "File uploaded successfully!", data: data});
    return
  } catch (error) {
    res.status(500).send(error);
  }
};

export { upload, uploadToS3 };
