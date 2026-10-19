module.exports.loginmiddleware=(req,res,next)=>{
    if(req.isAuthenticated()){
        console.log("middleware done");
        return next();
    }
    res.json({"error":"true"});
}
module.exports.editmiddleware=(req,res,next)=>{
    if(req.isAuthenticated() && req.user.core){
        return next();
    }
    res.json({"error":"not a core member"});
}