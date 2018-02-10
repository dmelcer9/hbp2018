const db =  require("./models/index.js");

const Op = db.Sequelize.Op;
require('./relations.js');

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt');
var app = express();

var port = process.env.PORT || 8080;

var authMiddleware = require("./user-auth.js")(db,['/createUser']);

var exporters = require("./createJSON.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/',authMiddleware);


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

app.post('/getEvents', async function(req, res){
  var allEvents = await db.Event.findAll({include:[{
    model: db.User,
    as:'users'
  },{
    model: db.User,
    as:'owner'
  },{
    model:db.Task,
    as:'Tasks'
  }]});

  var myEvents = allEvents.filter(event=>userIsInEvent(req.user,event));
  res.json(myEvents.map(exporters.event));
});

app.post('/getEvent', async function(req, res){
  const body = req.body;
  if(!body.eventId){
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

  res.json(exporters.event(event));
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

  //For some reason it doesn't send back the right thing
  //if this line isn't here
  event = await getEventByID(evid);

  res.json(exporters.event(event));
})

app.post('/joinEvent', async function(req,res){
  const body = req.body;
  if(!body.eventId){
    res.status(400).send("Invalid params");
    return;
  }

  const event = await db.Event.findOne({
    where:{
      eventCode: body.eventId
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
    }]
  })

  if(!event){
    res.status(400).send("Event does not exist");
    return;
  }

  if(userIsInEvent(req.user, event)){
    res.status(400).send("User is in event already!");
    return;
  }

  event.addUser(req.user);

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

//Creating db tables if they don't exist yet
async function f(){
  await db.sequelize.sync();
  console.log("Listening on port " + port);
  app.listen(port);
};

f();



function makeid(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
