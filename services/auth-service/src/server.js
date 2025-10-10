import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();
app.use("/auth", authRoutes);

app.get("/", (_, res) => res.send("Auth Service funcionando 🚀"));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Servidor Auth en puerto ${PORT}`));