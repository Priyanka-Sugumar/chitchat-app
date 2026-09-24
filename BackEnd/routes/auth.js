import {Router} from "express";
import pool from "../config/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import { protect } from "../middleware/auth.js";


const router = Router();
dotenv.config()
//Registration
router.post("/register",async (req,res) =>{

    const {email,password,name} = req.body  // destructuring 
    const existinguser= await pool.query('select * from users where email= $1',[email] )

    if (existinguser.rows.length >0)
    {
        return res.status(400).json({
                message:"user already exists"
            });
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const newUser=await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
  [name, email, hashedPassword])
  // No cookie is set here on purpose — registering should not auto-log-in the
// user; they're expected to explicitly log in afterward with their new credentials.
  res.status(200).json({
    "message":"New User created Successfully",
    "User":newUser.rows[0]
  })



})
//Login path
router.post("/login",async (req,res) =>{
    const {email,password} =req.body //destructuring 
    
    if (!email||!password){
        return res.status(400).json({
            "message":"Provide all the details"
        })
    }
    const user= await pool.query('select * from users where email= $1',[email])
    //console.log("queringdb",user)  //printing user
    if (user.rows.length===0){
        return res.status(400).json({
            "message":"No user found"
        })
    }
   const isMatch= await bcrypt.compare(password,user.rows[0].password);
   if(!isMatch){
    return res.status(404).json({
        "message":"Password incorrect"
    })

   }
   const token=jwt.sign(
    {id:user.rows[0].id},
    process.env.JWT_SECRET,
    {expiresIn: "30d"}
)
console.log(token) // just printing token
// secure:false is required for local dev over plain http://localhost — a
// "secure" cookie is silently dropped by the browser on any non-HTTPS
// connection. This must become true once deployed behind real HTTPS.
    res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge: 30 * 24 * 60 * 60 * 1000 //30 days
    })
    return res.status(200).json({
        "message":"Login successful",
        "user":{
            "id":user.rows[0].id,
            "email":user.rows[0].email,
            "name":user.rows[0].name
        }
    })
   

    

})

//Me

router.get("/me",protect,async (req,res) => {

    res.json(req.user);

})

//logout
router.post("/logout",(req,res) => {
    res.cookie("token","",{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:0
});
res.json({message:"Logged out successfuly"})
});
export default router;