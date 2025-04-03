import {config} from "dotenv"; config()
import app from './app'
import prisma from "./config/prisma";

const PORT = process.env.PORT;

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