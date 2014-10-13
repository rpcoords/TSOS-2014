///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }
		
		public executeProgram(memDivision, id): void {
			_StdOut.putText("entered function.");
			_ProcState = "ready";
			Control.displayPCB(id, "0", 1);
			var instruction = _Memory[memDivision][0][0];
			var row = 0;
			var col = 0;
			var nextRow = 0;
			var nextCol = 1;
			_ProcState = "running";
			while ((instruction !== "FF") && (_Memory[memDivision][nextRow][nextCol] !== "00")) {
				// Determine Instruction
				if (instruction === "A9") { // Load ACC with constant
					// Retrieves constant.
					col++;
					if (col >= 16) {
						row++;
						col = 0;
					}
					var con = _Memory[memDivision][row][col];
					
					// Put constant in ACC. Updates PC.
					_CPU.Acc = con;
					_CPU.PC = col + 1;
				} else if (instruction === "AD") { // Load ACC from memory
				
				} else if (instruction === "8D") { // Store ACC in memory
				
				} else if (instruction === "6D") { // Add with carry
				
				} else if (instruction === "A2") { // Load X register with constant
				
				} else if (instruction === "AE") { // Load X register from memory
				
				} else if (instruction === "A0") { // Load Y register with constant
				
				} else if (instruction === "AC") { // Load Y register from memory
				
				} else if (instruction === "EA") { // No Operation
				
				} else if (instruction === "00") { // Break (not memory address or constant)
				
				} else if (instruction === "EC") { // Compare byte in memory to X register
				
				} else if (instruction === "D0") { // Branch X bytes if Z = 0
				
				} else if (instruction === "EE") { // Increment value of byte
				
				} else if (instruction === "FF") { // System call
				
				} else { // Memory addresses and constants
				
				}
				
				// increment col and row
				col++;
				nextCol++;
				if (col >= 16) {
					row++;
					col = 0;
				} else if (nextCol === 16) {
					nextRow++;
					nextCol = 0;
				}
				
				// Updates PCB
				Control.displayPCB(id, instruction, 1);
				
				instruction = _Memory[memDivision][row][col]; // Next instruction
			}
		}
    }
}
