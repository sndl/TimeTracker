var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database(':memory:');
var db = new sqlite3.Database('test.db');

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
           created INTEGER DEFAULT NULL, 
           runtime INTEGER DEFAULT NULL, 
           is_running INTEGER NOT NULL DEFAULT 1,
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
    startTime = Math.floor(Date.now() / 1000);
    query = `INSERT OR IGNORE INTO Projects (name) VALUES ("${projectName}")`;
    db.run(query);
    query = `INSERT INTO Tasks (project_id, name, start_time) VALUES (
            (SELECT id FROM Projects WHERE name = "${projectName}"),
            "${name}",
            ${startTime}
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
            `;

    db.all(query, function(err, rows) {
      callback(rows);
    });
  }
}
