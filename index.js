const db =  require("./models/index.js");

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt');
var app = express();

var authMiddleware = require("./user-auth.js")(db,['/createUser']);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

var models = require('./models');

app.use('/',authMiddleware);

app.post('/verifyLogin', async function(req, res){

  res.send("User " + req.user.uname + " logged in.");

})


app.post('/createUser', async function(req, res){
  var body = req.body;

  if(!body.firstName || !body.lastName || !body.uname || !body.password){
    res.status(400).send("Invalid params");
    return;
  }

  //Make sure user doesn't exist
  var userExists = await db.User.findOne({where:{uname:body.uname}});
  if(userExists){
    res.status(400).send("User already exists");
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
