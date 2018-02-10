const db =  require("./models/index.js");

const User = db.User;
const Event = db.Event;
const Task = db.Task;

Task.belongsTo(User,{
  as: 'Assignee'
});

User.belongsToMany(Event, {through: "Membership"});
Event.belongsToMany(User, {through: "Membership"});

Event.hasMany(Task, {
  as: 'Tasks'
});

User.hasMany(Event,{
  as:'ownedEvents'
});

Event.belongsTo(User,{
  as:'owner'
});
