var homedir = require('os').homedir();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(homedir + "/.timetracker.db");

db.serialize(function () {
  // Initialize tables
  query = "PRAGMA foreign_keys = ON";
  db.run(query);
  query = "CREATE TABLE IF NOT EXISTS Projects (id INTEGER NOT NULL, name TEXT UNIQUE, PRIMARY KEY(id))";
  db.run(query);
  query = `CREATE TABLE IF NOT EXISTS Tasks (
           id INTEGER NOT NULL,
           project_id INTEGER NOT NULL, 
           name TEXT NOT NULL, 
           created INTEGER DEFAULT (strftime('%s','now')), 
           updated INTEGER DEFAULT NULL, 
           runtime INTEGER DEFAULT 0, 
           is_active INTEGER NOT NULL DEFAULT 1,
           PRIMARY KEY(id),
           FOREIGN KEY(project_id) REFERENCES Projects(id)
          )`
  db.run(query);

});

module.exports = {
  close: function() {
    db.close()
  },
  getProjects: function() {
    let projects;
    query = "SELECT name FROM Projects";
    db.each(query, function(err, row) {
      projects.push(row.name) 
    })
    console.log(projects)
    return projects
  },
  addTask: function(projectName, name) {
    query = `INSERT OR IGNORE INTO Projects (name) VALUES ("${projectName}")`;
    db.run(query);
    query = `INSERT INTO Tasks (project_id, name) VALUES (
            (SELECT id FROM Projects WHERE name = "${projectName}"),
            "${name}"
            )`;
    db.run(query);
  },
  getActiveTasks: function(callback) {
    query = `SELECT
             Projects.name as project_name,
             Tasks.*
             FROM Projects, Tasks
             WHERE Projects.id = Tasks.project_id
             AND is_active = 1
             ORDER BY created desc
            `;

    db.all(query, function(err, rows) {
      callback(rows);
    });
  },
  getTasksByDate: function(timestamp, callback) {
    query = `SELECT *
             FROM Tasks
             WHERE updated > ${timestamp}`;
    db.all(query, function(err, rows) {
      callback(rows);      
    });
  },
  getLastWeekTasks: function(timestamp, callback) {
    let lastWeekTimestamp = timestamp - 7 * 86400

    query = `SELECT Projects.name as project, replace(GROUP_CONCAT(DISTINCT Tasks.name), ',', ", ") as tasks, SUM(Tasks.runtime) as runtime
             FROM Projects, Tasks 
             WHERE Projects.id = Tasks.project_id 
              AND updated > ${lastWeekTimestamp}
              AND updated < ${timestamp} 
             GROUP BY Projects.name`;
    db.all(query, function(err, rows) {
      callback(rows);      
    });
  },
  saveRuntime(taskId, runtime) {
    query = `UPDATE Tasks
             SET runtime = "${runtime}", updated = strftime('%s','now')
             WHERE id = "${taskId}"`;
    db.run(query);
    console.log(`Save runtime for task with id: ${taskId}`);
  },
  loadRuntime(sw) {
    let taskId = sw.taskId;
    query = `SELECT runtime
             FROM Tasks
             WHERE id = ${taskId}`;
    db.get(query, function(err, row) {
      sw.totalTime = parseInt(row.runtime);
    });
  },
  finishTask(taskId) {
    query = `UPDATE Tasks
             SET is_active = 0
             WHERE id = "${taskId}"`;
    db.run(query);
  },
  deleteTask(taskId) {
    query = `DELETE FROM Tasks
             WHERE id = "${taskId}"`;
    db.run(query);
  }
}
