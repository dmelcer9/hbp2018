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

app.post('/createTask', async function(req, res){
  var body = req.body;
  if(!body.eventId || !body.name){
    res.status(400).send("Invalid params");
    return;
  }

  var event = await getEventByID(body.eventId);

  if(!event){
    res.status(400).send("Event does not exist");
    return;
  }

  if(!userIsInEvent(req.user, event)){
    res.status(400).send("User is not in event");
    return;
  }

  var task = await db.Task.create({
    name: body.name,
    description: body.description,
    completed: false
  })

  event.addTask(task);

  res.json(exporters.task(task));
})

app.post('/editTask', async function(req, res){
  try{
  var body = req.body;
  if(!body.id){
    res.status(400).send("Invalid params");
    return;
  }

  var task = await db.Task.findOne({
    where:{
      id: body.id
    },
    include:[{
      model: db.Event,
      include:[{
        model:db.User,
        as:"users"
      }]
    }]
  })

  if(!task){
    res.status(400).send("Invalid task id");
    return;
  }

  if(userIsInEvent(req.user, task.Event)){

    var toUpdate = {
      name: body.name,
      description: body.description
    }

    if(typeof(body.completed) !== "undefined"){
      toUpdate.completed = body.completed;
    }

    if(body.assigned == null){
      toUpdate.Assignee = null;
    } else if(typeof(body.assigned) !== "undefined"){
      var assignedUser = await db.User.findOne({
        where:{
          uname: body.assigned
        }
      });

      if(!assignedUser || !userIsInEvent(assignedUser, task.Event)){
        res.status(400).send("Cannot assign task to this user");
        return;
      }

      toUpdate.Assignee = assignedUser;
    }

    await task.update(toUpdate);

  } else{
    res.status(400).send("Invalid task id");
    return;
  }

  res.json(exporters.task(task));
}catch(e){console.log(e)}
})







//Creating db tables if they don't exist yet
async function f(){
  await db.sequelize.sync();
  console.log("Listening on port " + port);
  app.listen(port);
};

f();
