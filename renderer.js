const db = require('./db.js');
const Stopwatch = require('./stopwatch.js');

let taskId = 0;
let swList = [];

// Input rendering
document.getElementById("input-submit").addEventListener("click", function() {
  addTask();
})

document.addEventListener("keyup", function() {
  if (event.which === 13) {
    addTask();
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
}

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
    let btnFinish = divBlock.appendChild(document.createElement("button"));

    divBlock.id = "taskid_" + t.id;

    divProject.innerHTML = t.project_name;
    divProject.className = "project";
    divTask.innerHTML = t.name;
    divTask.className = "task";
    divTime.innerHTML = "00:00:00";
    divTime.className = "time";
    btnTime.innerHTML = "Start/Stop";
    btnTime.className = "switch";
    btnFinish.innerHTML = "Finish";
    btnFinish.className = "finish";

    swList[t.id] = new Stopwatch(t.id, renderSw);
    db.loadRuntime(swList[t.id]);
  }

  activeTasks.appendChild(tasksToDisplay);

  for (let t of tasks) {
    taskId = "taskid_" + t.id
    document.getElementById(taskId).getElementsByClassName("switch")[0].addEventListener("click", function() {
      swList[t.id].trigger();
    });

    document.getElementById(taskId).getElementsByClassName("finish")[0].addEventListener("click", function() {
      db.finishTask(taskId);
      db.getActiveTasks(listActiveTasks);
    });
  }
}

function renderSw(taskId) {
  let timestring = swList[taskId].timestring;
  taskId = "taskid_" + taskId;

  document.getElementById(taskId).getElementsByClassName("time")[0].innerHTML = timestring;
}
