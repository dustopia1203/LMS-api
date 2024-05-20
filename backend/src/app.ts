import express, { Express } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error";
import route from "./routes";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("combined"));

route(app);

app.use(errorMiddleware);

export default app;
