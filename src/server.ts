import {config} from "dotenv"; config()
import app from './app'
import { Prisma, PrismaClient } from "@prisma/client";

const PORT = process.env.PORT;
const prisma = new PrismaClient();

async function startServer(){

    try {

        await prisma.$connect()
        console.log("Serverless postgres -> Neon DB connection Successfull")
        
        app.listen(PORT, () => {
            console.log(`Server started at localhost:${PORT}`)
        })

    }catch(error: any){
        console.error(`Error occurred ${error.stack}`)
        process.exit(1);
    }

}

startServer();