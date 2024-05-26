import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"

import { router as tournamentRouter } from "./routes/tournament-router.mjs";
import { router as playerRouter } from "./routes/player-router.mjs";
import { router as matchRouter } from "./routes/match-router.mjs";

dotenv.config();

const MONGO_CONNECTION_STRING = process.env.CONNECTION_STRING!;
const port = process.env.PORT || 3000;

async function connectToMongo(connectionString: string) {
  await mongoose.connect(connectionString);
  console.log("Connected to MongoDB")
}

// Connect to the Mongo DB
try {
  await connectToMongo(MONGO_CONNECTION_STRING)
} catch (error) {
  console.log("Unable to connecto to MongoDB", error);
}

// initialize express app
const app: Express = express();
app.use(express.json())
app.use(cors())

// add routes
app.use('/api', tournamentRouter)
app.use('/api', playerRouter)
app.use('/api', matchRouter)

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Welcome to the Contest Coordinator REST API");
});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
