const db = require('./db.js');
const Stopwatch = require('./stopwatch.js');

let taskId = 0;
let swList = [];
let cmdDown = false;

// Input rendering
document.getElementById("input-submit").addEventListener("click", function() {
  addTask();
})

document.addEventListener("keyup", function() {
  if (event.which === 13) {
    addTask();
  }

  if (event.which === 91) {
    cmdDown = false;
  }
})

document.addEventListener("keydown", function() {
  if (event.which === 91) {
    cmdDown = true;
  }

  if ((event.which === 78 && event.ctrlKey) || (event.which === 78 && cmdDown === true)) {
    document.getElementById("input-project").focus();
  }

  if ((event.which === 83 && event.ctrlKey) || (event.which === 83 && cmdDown === true)) {
    let sw = swList.slice(-1).pop();
    let element = document.getElementById("taskid_" + sw.taskId).getElementsByClassName("switch")[0];

    sw.trigger();

    if (element.className.includes("active")) {
      element.className = "switch"
    } else {
      element.className = "switch active"
    }
  }
})

function addTask() {
  let project = document.getElementById("input-project");
  let task = document.getElementById("input-task");

  if (project.value === "" || task.value === "") {
    return
  }

  db.addTask(project.value, task.value);
  db.getActiveTasks(listActiveTasks);

  project.value = "";
  task.value = "";

  document.getElementById("input-project").blur();
  document.getElementById("input-task").blur();
}

// Hours worked this week
function getMonday() {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  let day = date.getDay();
  let mondayDate = Math.floor((date.setDate(date.getDate() - day + 1))/1000)
  
  return mondayDate
}

function renderHoursThisWeek(tasks) {
  let element = document.getElementById("this-week-hours");
  let totalTime = 0;
  let hours = 0

  for (let t of tasks) {
    totalTime += t.runtime; 
  }

  hours = Math.floor((totalTime/(60 * 60 * 1000)) * 2)/2;
  
  element.innerHTML = hours;
}

document.addEventListener("DOMContentLoaded", () => {db.getTasksByDate(getMonday(), renderHoursThisWeek)});
setInterval(() => {db.getTasksByDate(getMonday(), renderHoursThisWeek)}, 30 * 60 * 1000);

// Tasks rendering
document.addEventListener("DOMContentLoaded", db.getActiveTasks(listActiveTasks));

function listActiveTasks(tasks) {
  let activeTasks = document.getElementById("active-tasks");
  let tasksToDisplay = document.createDocumentFragment();

  while (activeTasks.firstChild) {
    activeTasks.removeChild(activeTasks.firstChild);
  }

  for (let t of tasks) {
    let divBlock = tasksToDisplay.appendChild(document.createElement("div"));
    let divProject = divBlock.appendChild(document.createElement("div"));
    let divTask = divBlock.appendChild(document.createElement("div"));
    let divTime = divBlock.appendChild(document.createElement("div"));
    let btnTime = divBlock.appendChild(document.createElement("button"));
    let btnDelete = divBlock.appendChild(document.createElement("button"));
    let btnFinish = divBlock.appendChild(document.createElement("button"));

    divBlock.id = "taskid_" + t.id;

    divProject.innerHTML = t.project_name;
    divProject.className = "project";
    divTask.innerHTML = t.name;
    divTask.className = "task";
    divTime.innerHTML = "00:00:00";
    divTime.className = "time";
    btnTime.innerHTML = "&#9654;";
    btnTime.className = "switch";
    btnDelete.innerHTML = "&#10007;";
    btnDelete.className = "delete";
    btnFinish.innerHTML = "&#10004;";
    btnFinish.className = "finish";

    swList[t.id] = new Stopwatch(t.id, renderSw);
    db.loadRuntime(swList[t.id]);
  }

  activeTasks.appendChild(tasksToDisplay);

  for (let t of tasks) {
    taskId = "taskid_" + t.id
    document.getElementById(taskId).getElementsByClassName("switch")[0].addEventListener("click", function() {
      if (this.className.includes("active")) {
        this.className = "switch"
      } else {
        this.className = "switch active"
      }
      swList[t.id].trigger();
    });

    document.getElementById(taskId).getElementsByClassName("finish")[0].addEventListener("click", function() {
      if (swList[t.id].started) {
        swList[t.id].stop();
      }
      delete swList[t.id];
      db.finishTask(t.id);
      db.getActiveTasks(listActiveTasks);
    });

    document.getElementById(taskId).getElementsByClassName("delete")[0].addEventListener("click", function() {
      if (swList[t.id].started) {
        swList[t.id].stop();
      }
      delete swList[t.id];
      db.deleteTask(t.id);
      db.getActiveTasks(listActiveTasks);
    });
  }
}

function renderSw(taskId) {
  let timestring = swList[taskId].timestring;
  taskId = "taskid_" + taskId;

  document.getElementById(taskId).getElementsByClassName("time")[0].innerHTML = timestring;
}
