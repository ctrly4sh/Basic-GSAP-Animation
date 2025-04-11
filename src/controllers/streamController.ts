import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStreamData = async (req: Request, res: Response) => {
    try {
        const streamData = await prisma.metaData.findMany()
        res.status(200).json(streamData);
    } catch (error) {
        console.error('Error fetching stream data:', error);
        res.status(500).json({ error: 'Failed to fetch stream data' });
    }
};