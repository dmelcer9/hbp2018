const db =  require("./models/index.js");
const Op = db.Sequelize.Op;
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

app.post('/getEvents', async function(req, res){
  var myId = req.user.id;

  var allEvents = await db.Event.findAll({include:[{
    model: db.User,
    as:'users'
  },{
    model: db.User,
    as:'owner'
  }]});
  var myEvents = allEvents.filter(event=>{
    return event.users.some(userInEvent=>{
      return myId === userInEvent.id;
    })
  })
  res.json(myEvents.map(exporters.event));
});

app.post('/createEvent', async function(req, res){
  const body = req.body;
  if(!body.title || !body.date){
    res.status(400).send("Invalid params");
    return;
  }
  var evid = makeid(6);
  var event = await db.Event.create({
    eventCode: evid,
    title: body.title,
    description: body.description,
    date: Date.parse(body.date)
  });
  await event.setOwner(req.user);
  await event.setUsers([req.user]);
  res.json(exporters.event(event));
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


function makeid(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
