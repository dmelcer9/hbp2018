var express = require('express');
var router = express.Router();
const db =  require("../models/index.js");
var exporters = require("../createJSON.js");
const h = require("../helpers");




router.post('', async function(req, res){
  var body = req.body;
  if(!body.eventId || !body.name){
    res.status(400).send("Invalid params");
    return;
  }

  var event = await h.getEventByID(body.eventId);

  if(!event){
    res.status(400).send("Event does not exist");
    return;
  }

  if(!h.userIsInEvent(req.user, event)){
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

router.delete('/:id', async function(req,res){
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

  if(h.userIsInEvent(req.user, task.Event)){
    await task.destroy();
    res.status(200).json({status:"OK"});
  } else{
    res.status(400).send("Invalid task id");
    return;
  }

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

  if(h.userIsInEvent(req.user, task.Event)){

    var toUpdate = {

    }

    if(typeof(body.name)!=="undefined"){
      toUpdate.name = body.name;
    }

    if(typeof(body.description) !== "undefined"){
      toUpdate.description = body.description;
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

      if(!assignedUser || !h.userIsInEvent(assignedUser, task.Event)){
        res.status(400).send("Cannot assign task to this user");
        return;
      }

      task.Assignee = assignedUser;
    }

    console.log(toUpdate);
    await task.update(toUpdate);

  } else{
    res.status(400).send("Invalid task id");
    return;
  }

  res.json(exporters.task(task));
})

module.exports = router;
