function usere(user){
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    uname: user.uname
  }
}

function evente(event){
  return {
    title: event.title,
    eventCode: event.eventCode,
    description: event.description,
    date: event.date,
    users: event.users.map(usere),
    owner: usere(event.owner),
    tasks: event.Tasks.map(taske)
  }
}

function taske(task){
  return {
    name: task.name,
    description: task.description,
    completed: task.completed,
    assignedTo: usere(task.Assignee)
  }
}

module.exports = {
  user: usere,
  event: evente,
  task: taske
}
