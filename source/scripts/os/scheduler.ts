

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
				// Place process at correct place in ready queue. Sorted so lower number priorities come first (1 before 5).
				var currPriority = -1;
				var found = false;
				if (this.priorities.length > 0) { // Checks if priorities is empty
				for (var a = 0; a < this.priorities.length; a++) { // Checks every element in priorities
					currPriority = this.priorities[a];
					if (+priority < +currPriority) { // if given priority less than a priority in queue, add to queue.
						this.priorities.splice(a, 0, priority);
						this.readyQueue.q.splice(a, 0, pid);
						this.pidUnits.q.splice(a, 0, units);
						this.xyStatus.q.splice(a, 0, [0, 0, memD]);
						found = true;
						break;
					}
				}
				if (found === false) { // if priority greater than all elements in queue.
					this.priorities.push(priority);
					this.readyQueue.enqueue(pid);
					this.pidUnits.enqueue(units);
					this.xyStatus.enqueue([0, 0, memD]);
				}
				} else { // if first priority added to queue.
					this.priorities.push(priority);
					this.readyQueue.enqueue(pid);
					this.pidUnits.enqueue(units);
					this.xyStatus.enqueue([0, 0, memD]);
				}
			} else {
				this.readyQueue.enqueue(pid); // adds pid to ready queue
				this.pidUnits.enqueue(units); // adds units needed to execute program to pidUnits
				// Add memory execution start points to xyStatus.
				this.xyStatus.enqueue([0, 0, memD]);
			}
			
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
			console.log("Context switch xy: " + xy)
			_row = xy[0];
			_col = xy[1];
			memDivision = xy[2];
			if (memDivision > 2) {
				this.swap(_id, memDivision);
				_PCB.updateLocation(_id, "Memory");
			}
			
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
		
		public swap(id, memD) {
			memDivision = _CurrDivision;
			_CurrDivision--;
			if (_CurrDivision < 0) {
				_CurrDivision = 2;
			}
			
			// Get variables of most recently executed process.
			var md = 2;
			var pid = 2;
			if (this.readyQueue.getSize() > 0) {
				var xy = this.xyStatus.q[this.xyStatus.getSize() - 1];
				md = xy[2];
				xy[2] = memD;
				this.xyStatus.q[this.xyStatus.getSize() - 1] = xy;
				pid = this.readyQueue.q[this.readyQueue.getSize() - 1];
				
				_PCB.updateLocation(pid, "Disk");
			}
			
			// Take process out of storage.
			var filename = "*p" + id;
			var prog = _krnFileSysDriver.output(filename);
			_krnFileSysDriver.krnFileSysISR(5, filename, ""); // delete file in storage
			
			// Place last process in storage.
			if (this.readyQueue.getSize() > 0) {
				var name = "*p" + pid;
				var data = "";
				// Take program from Memory.
				for (var a = 0; a < 16; a++) {
					for (var b = 0; b < 16; b++) {
						data = data + _Memory[md][a][b];
					}
				}
				
				// Create and write file in storage.
				_krnFileSysDriver.krnFileSysISR(2, name, "");
				_krnFileSysDriver.krnFileSysISR(3, name, data);
			}
			
			// Place current process in memory.
			var program = "";
			var loc = 0;
			// Convert from hex to ASCII characters.
			for (var a = 0; a < 256; a++) {
				loc = a * 2;
				var num = prog.substr(loc, 2);
				//console.log(num);
				program = program + num;
			}
			var instruction = "";
			for (var a = 0; a < 16; a++) {
				for (var b = 0; b < 16; b++) {
					instruction = program.substr(0, 2);
					if (program.length > 2) {
						program = program.slice(2, program.length);
					}
					_Memory[memDivision][a][b] = instruction;
					console.log(_Memory[memDivision][a][b]);
				}
			}
		}
	}

}