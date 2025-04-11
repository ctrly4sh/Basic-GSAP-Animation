import express, {NextFunction, Request, Response} from "express"
import cors from "cors"
import uploadRouter from "./routes/uploadRoutes"
import streamRouter from "./routes/streamRoutes"
const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/', uploadRouter)
app.use('/api/', streamRouter)

app.use((req: Request, res: Response) => {
    res.status(404).send({message: `Internal server error ${req.originalUrl} not founder`})
})

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`Error occurred ${error.stack}`)
    res.status(500).send({message: "Internal server error occurred"});
});

export default app;

