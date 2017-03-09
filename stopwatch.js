const db = require('./db.js');

module.exports =
class Stopwatch {
  constructor(taskId, callback) {
    this.taskId = taskId;
    this.callback = callback;
    this.startTime = Date.now();
    this.stopTime = 0;
    this.time = 0;
    this._totalTime = 0;
    this.started = false;
    this.interval = null;
    this.saveInterval = null;
    this.h = 0;
    this.m = 0;
    this.s = 0;
  }

  trigger() {
    if(!this.started) {
      this.startTime = Date.now()
      this.started = true;
      this.interval = setInterval(() => {this.count.call(this)}, 1000); 
      this.saveInterval = setInterval(() => {db.saveRuntime(this.taskId, this._totalTime + Date.now() - this.startTime)}, 10000);
    } else {
      this.stopTime = Date.now();
      this.started = false;
      this._totalTime += this.stopTime - this.startTime;
      clearInterval(this.interval);
      clearInterval(this.saveInterval);
      db.saveRuntime(this.taskId, this._totalTime);
    }
  }

  count() {
    this.time = Math.floor((Date.now() - this.startTime + this._totalTime) / 1000);

    this.h = Math.floor(this.time / 3600);
    this.m = Math.floor((this.time - (this.h * 3600)) / 60);
    this.s = Math.floor(this.time - (this.h * 3600) - (this.m * 60));
    if (this.h < 10) { this.h = "0" + this.h }
    if (this.m < 10) { this.m = "0" + this.m }
    if (this.s < 10) { this.s = "0" + this.s }

    this.callback(this.taskId);
  }

  get timestring() {
    return this.h + ":" + this.m + ":" + this.s;
  }

  set totalTime(totalTime) {
    this._totalTime = totalTime;
    this.count();
  }
}

