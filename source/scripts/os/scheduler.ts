

module TSOS {

	export class Scheduler {
		
		constructor(public readyQueue = new Queue(),
					public runningId = 0,
					public remainingUnits = 0,
					public pidUnits = new Queue(),
					public currUnits = 0,
					public xyStatus = new Queue(),
//<<<<<<< HEAD
					public priorities = new Array(),
					public algorithm = "rr",
					public readyForSwitch = false) {
//=======
//					public algorithm = "rr") {
//>>>>>>> 8f5be46f6b6a07b6c705d225a142a2841729a641
			// _Quantum stored as global variable.
			/* readyQueue = the Ready Queue
			 * runningId = PID for Process in execution
			 * remainingUnits = units before next context switch
			 * pidUnits = units of time for every process in ready queue (PID in readyQueue[1] has pidUnits[1] units)
			 * currUnits = units of time running PID needs to finish execution
			 * xyStatus = queue of arrays (similar to pidUnits) that stores col and row values for memory navigation ([_row value, _col value, memDivision value])
			 * algorithm = scheduling algorithm being used by CPU Scheduler
			 * readyForSwitch = tells scheduler to perform context switch when process execution has completed
			 */
			
			
		}
		
		public addProcess(pid: number, units: number, memD: number, priority: number) {
			if (this.algorithm === "priority") {
				// TODO: Place process at correct place in ready queue. Sorted so lower number priorities come first (1 before 5).
				var currPriority = -1;
				for (var a = 0; a < this.priorities.length; a++) {
					currPriority = this.priorities[a];
					if (priority < currPriority) {
						// Make subarray of elements including and after a.
						
						// Place priorities in position a.
						this.priorities[a] = priority;
						
						// Concat the two arrays.
					}
					/*currPID = this.readyQueue.dequeue();
					currPriority = this.priorities.dequeue();
					if (priority < currPriority) {
						break;
					} else {
						this.readyQueue.enqueue(currPID);
						this.priorities.enqueue(currPriority);
					} */
				}
				console.log("priorities: " + this.priorities);
				/*
				this.readyQueue.enqueue(pid);
				this.priorities.enqueue(priority)
				if (currPID !== -1) {
					this.readyQueue.enqueue(currPID);
				}
				*/
			} else {
				this.readyQueue.enqueue(pid); // adds pid to ready queue
			}
			
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
			var i = 0;
			for (var b = 0; b < _PCB.pid.length; b++) {
				if (+_PCB.pid[b] === +this.runningId) {
					i = b;
					break;
				}
			}
			//console.log("RQ before units check " + this.readyQueue)
			if (this.currUnits !== 0) {
				this.readyQueue.enqueue(this.runningId);
				this.pidUnits.enqueue(this.currUnits);
				this.xyStatus.enqueue([_row, _col, memDivision]);
				
				// Update PCB.
				_PCB.state[i] = "ready";
			}
			//console.log("RQ after units check "+this.readyQueue)
			// Take next process off Ready Queue. Update runningId.
			this.runningId = this.readyQueue.dequeue();
			_id = this.runningId;
			//console.log("RQ after remove "+this.readyQueue)
			// Take time units value off pidUnits. Update currUnits and remainingUnits.
			// If currUnits > Quantum, use Quantum for remainingUnits.
			this.currUnits = this.pidUnits.dequeue();
			this.remainingUnits = _Quantum;
			
			// Update memory position using xyStatus.
			var xy = this.xyStatus.dequeue();
			//console.log(xy)
			_row = xy[0];
			_col = xy[1];
			memDivision = xy[2];
			
			// Resets readyForSwitch to default. Prevents constant context switches.
			this.readyForSwitch = false;
			
			// Update PCB.
			var index = -1;
			//console.log(+this.runningId)
			for (var b = 0; b < _PCB.pid.length; b++) {
				if (+_PCB.pid[b] === +this.runningId) {
					index = b;
					break;
				}
			}
			_ProcState = "running";
			
			// Update CPU Registers.
			_CPU.PC = _PCB.pc[index];
			_CPU.Acc = _PCB.acc[index];
			_CPU.Xreg = _PCB.x[index];
			_CPU.Yreg = _PCB.y[index];
			_CPU.Zflag = _PCB.z[index];
			
			// Log scheduling event: Context Switch.
			Control.hostLog("Context Switch", "CPU scheduler");
		}
		
		// Run during every cycle in which a program is executing.
		public onCycle() {
			this.remainingUnits--;
			this.currUnits--;
		}
		
		public remove(id: number) {
			if (+id === +this.runningId) {
				// prepare for context switch
				this.currUnits = 0;
				this.remainingUnits = 0;
				
				// context switch
				if (this.readyQueue.getSize() > 0) {
					this.contextSwitch();
				}
			} else {
				for (var b = 0; b < this.readyQueue.getSize(); b++) {
					if (+id === +this.readyQueue.q[b]) {
						this.readyQueue.q.splice(b, 1);
						this.pidUnits.q.splice(b, 1);
						this.xyStatus.q.splice(b, 1);
						break;
					}
				}
			}
			
			// check whether or not to stop execution
			if (_Actives.length > 0) {
			} else {
				_CPU.isExecuting = false;
			}
		}
	}

}