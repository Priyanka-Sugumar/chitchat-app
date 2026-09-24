import { Router } from "express";   
import pool from "../config/db.js"
import { protect } from "../middleware/auth.js";

const router=Router();

router.get("/", protect,async(req,res) =>{
const result= await pool.query('select id,name,email from users where id <> $1',[req.user.id])

//console.log(result) // printing results
res.json(result.rows)
})
export default router;