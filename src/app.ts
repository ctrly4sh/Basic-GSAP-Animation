import express, {NextFunction, Request, Response} from "express"
import router from "./routes/uploadRoutes"
import cors from "cors"
const app = express()

app.use(express.json())
app.use(cors())

app.use('/abr/', router)
app.use((req: Request, res: Response) => {
    res.status(404).send({message: `Internal server error ${req.originalUrl} not founder`})
})

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`Error occurred ${error.stack}`)
    res.status(500).send({message: "Internal server error occurred"});
});

export default app;

