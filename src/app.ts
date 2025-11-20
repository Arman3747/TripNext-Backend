import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandleer";
import notFound from "./app/middlewares/notFound";

const app = express();

app.use(express.json());
app.use(cors());

//Routes
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Tour Management Backend!",
  });
});

//Global Error Handler

app.use(globalErrorHandler); // don't call

// 404 not found
app.use(notFound);

export default app;
