import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import pool from "../config/db.js"

dotenv.config();
export const protect = async (req,res,next) => {
    try
    {
        const token=req.cookies.token;
        if(!token){
            return res.status(400).json(
                {
                    "message":"No token"
                }
            )
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);// printing decoded value

// Re-query the user by the token's decoded id instead of trusting the token
// payload alone — the token stays valid for 30 days, but the account it
// points to could have been deleted or changed in that window.

        const lookup=await pool.query('select id,email,name from users where id= $1',[decoded.id]);
        if(lookup.rows.length ===0)
        {
        return res.status(400).json(
            {
                "message":"No user exists"
            }
        )
        }
        req.user=lookup.rows[0];
        next();


    }catch(err){

        return res.status(400).json({
            "message":"Token incorrect"
        })
    }
    
};