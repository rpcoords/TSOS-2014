

module TSOS {
	export class ProcessRegisters {
		constructor(public pid = new Array(), // numbers
					public ir = new Array(), // strings
					public pc = new Array(), // numbers
					public acc = new Array(), // strings
					public x = new Array(), // numbers
					public y = new Array(), // numbers
					public z = new Array(), // numbers
					public priority = new Array(), // numbers
					public state = new Array(), // strings
					public location = new Array()) { // strings
			/*
			var pid = id;
			var ir = instruction;
			var pc;
			var
			//var cpuRegisters = cpu;
			var priority = prior;
			var state = s;
			*/
		}
		
		public setRegisters(id: number, prior: number, loc: string) {
			this.pid.push(id);
			this.ir.push("0");
			this.pc.push(0);
			this.acc.push("0");
			this.x.push(0);
			this.y.push(0);
			this.z.push(0);
			this.priority.push(prior);
			this.state.push("ready");
			this.location.push(loc);
		}
		
		public updateForId(id: number, instruction: string, counter: number, a: string, xReg: number, yReg: number, zFlag: number, s: string) {
			//var index = this.pid.indexOf(id);
			var index = -1;
			for (var b = 0; b < this.pid.length; b++) {
				if (+this.pid[b] === +id) {
					index = b;
				}
			}
			
			//console.log(s)
		/*	if(s === "terminated"){
				this.state[index] = s
				//console.log("update terminated")
			}else{ */
				//console.log("update id: " + instruction)
				this.ir[index] = instruction;
				this.pc[index] = counter;
				this.acc[index] = a;
				this.x[index] = xReg;
				this.y[index] = yReg;
				this.z[index] = zFlag;
				this.state[index] = s;
				//console.log("updated: " + this.ir[index])
				//console.log("id = " + id)
				//console.log("--------------")
		//	}
		}
		
		public updateLocation(id: number, loc: string) {
			var index = -1;
			for (var b = 0; b < this.pid.length; b++) {
				if (+this.pid[b] === +id) {
					index = b;
				}
			}
			
			this.location[index] = loc;
		}
	}
}