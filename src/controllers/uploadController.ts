import express, { Request, Response } from "express"

export const health = (req: Request, res: Response) => {

    try {

        res.status(200).send({success: true, message: "Upload API Health okay"})
        return;
    
    }catch(error: any){

    }
}