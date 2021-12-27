require("dotenv").config();
require("./config/database").connect();
const express=require("express");
const User = require("./model/user");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cookiesParser=require("cookie-parser");
const auth=require("./middleware/auth");
const app=express();
app.use(express.json());
app.use(cookiesParser());

let courses=[
        {       
                course_id:101,
                course:'Angular',
                fee:299
        },
        {       
                course_id:102,
                course:'react js',
                fee:399
        },
        {       
                course_id:103,
                course:'spring boot',
                fee:1299
        },
        {       
                course_id:104,
                course:'PostgreSQL',
                fee:999
        }
]
app.get("/",(req,res)=>{
    res.send({result:"SUCCESS",data:"Welcome to the auth-system"})
});

/*
title:  registration api
step-1: collect all information
step-2: validate mandatory fields
step-3: check already registered
step-4: take care of password encrypt/ decrypt
step-5: generate token
step-6: send success message
*/
app.post("/registration",async (req,res)=>{
    try {
        const { first_name, last_name, email, password } = req.body;
    if(!(first_name && last_name && email && password)){
        res.status(400).send({result:"ERROR",message:"All fields are mandatory, please pass valid date"});
    }
    const userExist= await User.findOne({email});
    if(userExist){
        res.status(401).send({result:"WARNING",message:"User already registered with this email id, please login"})
    }
    const myEncryptPassword = await bcrypt.hash(password,10);
    const user= await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(),
        password:myEncryptPassword
    });
    // token
    const token=jwt.sign(
        {user_id : user._id, email},
        process.env.SECRET_KEY,
        {
            expiresIn:"2h"
        }
    )
    user.token=token
    //update or not

    // dont expose password back to the user
    user.password=undefined;
    res.status(201).json(user);
    } 
    catch (error) {
        console.log("Error Occurred, error message : ",error.message);    
    }
})
app.post("/login", async (req,res)=>{
    try {
        const { email, password }=req.body;
    if(!(email && password)){
        res.status(400).send({result:"ERROR",message:"Kindly pass both email and password properly"});
    }
    const user=await User.findOne({email});
    if((user) && (await bcrypt.compare(password,user.password))){
        const token=jwt.sign(
            {userId:user._id,email},
            process.env.SECRET_KEY,
            {
                expiresIn:"2h"
            }
            );
            user.token=token;
            user.password=undefined;
            // if you want to use cookies
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.status(200).cookie("token", token, options).json({
                success: true,
                token,
                user,
              });
    }
    res.status(404).send({result:"ERROR",message:"Email or Password is incorrect"})
    } catch (error) {
        console.log("Error>>",error.message);
    }

})

app.get("/dashboard", auth , (req,res)=>{
    res.status(200).send({result:"success",message:"welcome to the auth-system"});
})
app.get("/courses", auth, (req,res)=>{
    res.status(200).send({result:"SUCCESS",data:courses});
})
module.exports = app