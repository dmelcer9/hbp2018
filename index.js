const db =  require("./models/index.js");
require('./relations.js');

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt');
var app = express();

var port = 8080;

var authMiddleware = require("./user-auth.js")(db,['/createUser']);

var exporters = require("./createJSON.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/',authMiddleware);

app.post('/createEvent', async function(req, res){
  if(!body.firstName || !body.lastName){
    res.status(400).send("Invalid params");
    return;
  }
})

app.post('/getCurrentUser', async function(req, res){

  res.json(exporters.user(req.user));

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
  await db.User.create({
    firstName:body.firstName,
    lastName:body.lastName,
    uname:body.uname,
    passwordHashed: hashed
  });

  res.status(200).send("Created User");
})

console.log("Listening on port " + port);
app.listen(port);
