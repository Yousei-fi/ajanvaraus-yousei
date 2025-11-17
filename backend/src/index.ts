import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { r } from "./routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN?.split(",") ?? ["http://localhost:5173"],
    credentials: true,
  })
);

app.use("/api", r);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  if (!res.headersSent) {
    res.status(500).json({ error: "internal" });
  }
});

const port = Number(process.env.PORT ?? 8090);
app.listen(port, () => {
  console.log(`API on :${port}`);
});
