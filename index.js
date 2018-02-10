const db =  require("./models/index.js");

const Op = db.Sequelize.Op;
require('./relations.js');

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt');
var app = express();

var port = process.env.PORT || 8080;

var authMiddleware = require("./user-auth.js")(db,['/users']);

var exporters = require("./createJSON.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/',authMiddleware);

var events = require("./routes/events");
app.use('/events', events);

var events = require("./routes/user");
app.use('/users', events);

var events = require("./routes/tasks");
app.use('/tasks', events);

function userIsInEvent(user, event){
  var myId = user.id;
  return event.users.some(userInEvent=>{
    return myId === userInEvent.id;
  })
}

async function getEventByID(id){
  var event = await db.Event.findOne({
    where:{
      eventCode: id
    },
    include:[{
      model: db.User,
      as:'users'
    },{
      model: db.User,
      as:'owner'
    },{
      model:db.Task,
      as:'Tasks'
  }]});

  return event;
}





//Creating db tables if they don't exist yet
async function f(){
  await db.sequelize.sync();
  console.log("Listening on port " + port);
  app.listen(port);
};

f();
