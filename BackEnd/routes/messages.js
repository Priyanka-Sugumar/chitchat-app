import { Router } from "express";
import pool from "../config/db.js"
import { protect } from "../middleware/auth.js";

//console.log("here comes the message route");
const router=Router();
router.get("/:userId",protect,async (req,res)=>{

    const otherId=req.params.userId;
    console.log(otherId);
    const result = await pool.query(`select * from messages where 
        (sender_id= $1 and receiver_id=$2) or (receiver_id=$1 AND sender_id=$2) 
        Order by created_at asc`,
        [req.user.id,otherId]);

    res.json(result.rows);

})

export default router;