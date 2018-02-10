function usere(user){
  if(!user) return user;
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    uname: user.uname
  }
}

function evente(event){
  if(!event) return event;
  return {
    title: event.title,
    eventCode: event.eventCode,
    description: event.description,
    date: event.date,
    users: (event.users)?event.users.map(usere):[],
    owner: usere(event.owner),
    tasks: (event.Tasks)?event.Tasks.map(taske):[]
  }

}

function taske(task){
  if(!task) return task;
  return {
    name: task.name,
    description: task.description,
    completed: task.completed,
    isAssigned: (task.Assignee)?true:false,
    assignedTo: usere(task.Assignee),
    id: task.id
  }
}

module.exports = {
  user: usere,
  event: evente,
  task: taske
}
