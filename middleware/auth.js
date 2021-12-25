const jwt=require("jsonwebtoken");

const auth = (req,res,next) =>{
    console.log("cookies>>>"+JSON.stringify(req.cookies));
    const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer","");
    if(!token){
        return res.status(403).send({result:"Error",message:"Token is missing"});
    }
    try {
        const decode=jwt.verify(token,process.env.SECRET_KEY);
        console.log("decode>>",decode);
        req.user=decode;
    } catch (error) {
        res.status(401).send({result:"ERROR",message:"Invalid Token"})
    }
    return next();
}

module.exports= auth