

module TSOS {

	export class Scheduler {
		
		constructor(public readyQueue = new Queue(),
					public runningId = 0,
					public remainingUnits = 0,
					public pidUnits = new Queue(),
					public currUnits = 0,
					public xyStatus = new Queue()) {
			// _Quantum stored as global variable.
			/* readyQueue = the Ready Queue
			 * runningId = PID for Process in execution
			 * remainingUnits = units before next context switch
			 * pidUnits = units of time for every process in ready queue (PID in readyQueue[1] has pidUnits[1] units)
			 * currUnits = units of time running PID needs to finish execution
			 * xyStatus = queue of arrays (similar to pidUnits) that stores col and row values for memory navigation ([_row value, _col value, memDivision value])
			 */
			
			
		}
		
		public addProcess(pid: number, units: number, memD: number) {
			this.readyQueue.enqueue(pid); // adds pid to ready queue
			this.pidUnits.enqueue(units); // adds units needed to execute program to pidUnits
			// Add memory execution start points to xyStatus.
			this.xyStatus.enqueue([0, 0, memD]);
			
			// Log scheduling event: Added process (PID) to Ready Queue.
			var msg = "Process " + pid + " added to Ready Queue.";
			Control.hostLog(msg, "CPU scheduler");
		}
		
		public contextSwitch() {
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
			Control.hostLog("Context Switch", "CPU scheduler");
		}
		
		// Run during every cycle in which a program is executing.
		public onCycle() {
			this.remainingUnits--;
			this.currUnits--;
		}
		
	}

}