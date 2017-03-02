module.exports = class Stopwatch {
  constructor(taskId, callback) {
    this.taskId = taskId;
    this.callback = callback;
    this.startTime = 0;
    this.stopTime = 0;
    this.time = 0;
    this.totalTime = 0;
    this.started = false;
    this.interval = null;
    this.h = 0;
    this.m = 0;
    this.s = 0;
  }
 
  trigger() {
    if(!this.started) {
      this.startTime = Date.now()
      this.started = true;
      this.interval = setInterval(() => {this.count.call(this)}, 1000); 
    } else {
      this.stopTime = Date.now();
      this.started = false;
      this.totalTime += this.stopTime - this.startTime;
      clearInterval(this.interval);
    }
  }

  count() {
    this.time = Math.floor((Date.now() - this.startTime + this.totalTime) / 1000);

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
}
