var express = require('express');
var router = express.Router();
const db =  require("../models/index.js");
var exporters = require("../createJSON.js");


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


router.post('', async function(req, res){
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

router.put('/:id', async function(req, res){

  var body = req.body;


  var task = await db.Task.findOne({
    where:{
      id: req.params.id
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
})

module.exports = router;
