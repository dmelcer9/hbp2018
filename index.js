const db =  require("./models/index.js");

var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

var models = require('./models');

var bcrypt = require('bcrypt');

//Returns a user instance or null
async function getUserAuth(uname, pass){
  var user = await db.User.findOne({where:{uname:uname}});
  if(!user){
    return false;
  }
  var valid = await bcrypt.compare(pass,user.passwordHashed);
  if(valid) return user;
  return false;
}

app.get('/verifyLogin', async function(req, res){
  var body = req.headers;
  console.log(body.uname);
  if(!body.uname || !body.password){
    res.status(500).send("Invalid params");
    return
  }

  var user = await getUserAuth(body.uname, body.password);
  if(user){
    res.send("Valid");
  } else{
    res.send("Invalid");
  }
})


app.post('/createUser', async function(req, res){
  var body = req.body;

  if(!body.firstName || !body.lastName || !body.uname || !body.password){
    res.status(500).send("Invalid params");
    return;
  }
  var hashed = await bcrypt.hash(body.password, 10);
  console.log(hashed);
  await models.User.create({
    firstName:body.firstName,
    lastName:body.lastName,
    uname:body.uname,
    passwordHashed: hashed
  });

  res.status(200).send("Created User");
})

var f = async function(){
  await db.User.sync();

  console.log("Listening");
  app.listen(8080);

};

f();
