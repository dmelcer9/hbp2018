var bcrypt = require('bcrypt');

//Returns a user instance or null
async function getUserAuth(uname, pass, db){
  var user = await db.User.findOne({where:{uname:uname}});
  if(!user){
    return false;
  }
  var valid = await bcrypt.compare(pass,user.passwordHashed);
  if(valid) return user;
  return false;
}

module.exports = (db,excluded)=>{
  return async function(req,res,next){
    if(excluded.includes(req.url)){
      next();
    } else{
      var body = req.body;
      if(!body.uname || !body.password){
        res.status(401).send("No credentials supplied");
        return
      }

      var user = await getUserAuth(body.uname, body.password, db);
      if(user){
        req.user = user;
        next()
      } else{
        res.status(401).send("Invalid credientials");
      }
    }
  }
}
