

module TSOS {
	export class Process {
		constructor(id = 0, instruction = "", cpu = new Cpu(0, "0", 0, 0, 0, false), prior = 0, s = "") {
			var pid = id;
			var ir = instruction;
			var cpuRegisters = cpu;
			var priority = prior;
			var state = s;
		}
	}
}