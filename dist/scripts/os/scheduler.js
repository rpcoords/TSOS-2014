var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler(readyQueue, runningId, remainingUnits, pidUnits, currUnits, xyStatus) {
            if (typeof readyQueue === "undefined") { readyQueue = new TSOS.Queue(); }
            if (typeof runningId === "undefined") { runningId = 0; }
            if (typeof remainingUnits === "undefined") { remainingUnits = 0; }
            if (typeof pidUnits === "undefined") { pidUnits = new TSOS.Queue(); }
            if (typeof currUnits === "undefined") { currUnits = 0; }
            if (typeof xyStatus === "undefined") { xyStatus = new TSOS.Queue(); }
            this.readyQueue = readyQueue;
            this.runningId = runningId;
            this.remainingUnits = remainingUnits;
            this.pidUnits = pidUnits;
            this.currUnits = currUnits;
            this.xyStatus = xyStatus;
            // _Quantum stored as global variable.
            /* readyQueue = the Ready Queue
            * runningId = PID for Process in execution
            * remainingUnits = units before next context switch
            * pidUnits = units of time for every process in ready queue (PID in readyQueue[1] has pidUnits[1] units)
            * currUnits = units of time running PID needs to finish execution
            * xyStatus = queue of arrays (similar to pidUnits) that stores col and row values for memory navigation ([_row value, _col value, memDivision value])
            */
        }
        Scheduler.prototype.addProcess = function (pid, units, memD) {
            this.readyQueue.enqueue(pid); // adds pid to ready queue
            this.pidUnits.enqueue(units); // adds units needed to execute program to pidUnits

            // Add memory execution start points to xyStatus.
            this.xyStatus.enqueue([0, 0, memD]);

            // Log scheduling event: Added process (PID) to Ready Queue.
            var msg = "Process " + pid + " added to Ready Queue.";
            TSOS.Control.hostLog(msg, "CPU scheduler");
        };

        Scheduler.prototype.contextSwitch = function () {
            // Check if process is done executing.
            // If no, push to end of ready queue.
            if (this.currUnits !== 0) {
                this.readyQueue.enqueue(this.runningId);
                this.pidUnits.enqueue(this.currUnits);
                this.xyStatus.enqueue([_row, _col, memDivision]);
            }

            // Take next process off Ready Queue. Update runningId.
            this.runningId = this.readyQueue.dequeue();
            _id = this.runningId;

            // Take time units value off pidUnits. Update currUnits and remainingUnits.
            // If currUnits > Quantum, use Quantum for remainingUnits.
            this.currUnits = this.pidUnits.dequeue();
            this.remainingUnits = _Quantum;

            // Update memory position using xyStatus.
            var xy = this.xyStatus.dequeue();
            _row = xy[0];
            _col = xy[1];
            memDivision = xy[2];

            // Log scheduling event: Context Switch.
            TSOS.Control.hostLog("Context Switch", "CPU scheduler");
        };

        // Run during every cycle in which a program is executing.
        Scheduler.prototype.onCycle = function () {
            this.remainingUnits--;
            this.currUnits--;
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
