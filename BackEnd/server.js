import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import messageRoutes from "./routes/messages.js"
import cookieParser from "cookie-parser";
import http from "http";
import { initwebsocket } from "./ws/index.js";
import cors from "cors";

dotenv.config();

const app= express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5174", 
  credentials: true    
}
));
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/messages",messageRoutes);

app.get("/", (req,res)=>{
    res.send("Server is Alive");

});

const server =http.createServer(app);
initwebsocket(server);
server.listen("5001",() =>{
    console.log("Server is running on port 5001");
});

// const result =await pool.query('SELECT NOW()');
// console.log(result.rows[0]);  ->test connection to database

