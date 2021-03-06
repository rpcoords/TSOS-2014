///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";
			
			// Display Memory
			this.initMemory();
			
			// Display PCB
			this.initPCB();
			
			// Display CPU
			this.initCPU();
			
			// Display FSDD
			this.displayFSDD();

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
		
		public static initMemory(): void {
			for (var a = 0; a <= 95; a++) {
				memory[a] = new Array(8);
			}
			
			var taMemory = <HTMLInputElement> document.getElementById("taMemory");
			for (var a = 0; a < 48; a++) { //95
				if (a === 16) {
					taMemory.value = taMemory.value + "\n";
				} else if (a === 32) {
					taMemory.value = taMemory.value + "\n";
				}
				
				taMemory.value = taMemory.value + "0x" + memIndex[a] + " | ";
				for (var b = 0; b <= 15; b++) {
					memory[a][b] = "00";
					taMemory.value = taMemory.value + memory[a][b] + " ";
				}
				taMemory.value = taMemory.value + "\n";
			}
		}
		
		public static fillMemory(): void {
			var taMemory = <HTMLInputElement> document.getElementById("taMemory");
			// Clear taMemory
			taMemory.value = "";
			// Fill taMemory
			for (var division = 0; division < _Memory.length; division++) {
				for (var row = 0; row < _Memory[0].length; row++) { //arbitrary index chosen to get number of rows
					var numLabel = row*_Memory[0][0].length
					var strLabel = numLabel.toString(16)
					if (row === 0) {
						strLabel = "0"+strLabel
					}
					taMemory.value = taMemory.value + "0x" + division + strLabel + " | ";
					for (var col = 0; col<_Memory[0][0].length; col++){ //index chosen for same reason
						taMemory.value = taMemory.value + _Memory[division][row][col] + " ";
					}
					taMemory.value = taMemory.value + "\n";
					
				}
				taMemory.value = taMemory.value + "\n";
			}
		}
		
		public static clearMemory(): void {
			var taMemory = <HTMLInputElement> document.getElementById("taMemory");
			// Clear taMemory
			taMemory.value = "";
			
			// Fill taMemory
			for (var a = 0; a <= 95; a++) {
				if (a === 32) {
					taMemory.value = taMemory.value + "\n";
				} else if (a === 64) {
					taMemory.value = taMemory.value + "\n";
				}
				
				taMemory.value = taMemory.value + "0x" + memIndex[a] + " | ";
				for (var b = 0; b <= 7; b++) {
					memory[a][b] = "00";
					taMemory.value = taMemory.value + memory[a][b] + " ";
				}
				taMemory.value = taMemory.value + "\n";
			}
		}
		
		public static initPCB(): void {
			var taPCB = <HTMLInputElement> document.getElementById("taPCB");
			taPCB.value = "PID: \t\t" + "\nPC : \t\t" + "\nIR : \t\t" + "\nACC: \t\t" + "\nX  : \t\t" + "\nY  : \t\t" + "\nZ  : \t\t" + "\nPriority: \t" + "\nState: \t\t" + "\nLocation: \t";
		}
		
		public static displayPCB(pid, ir, priority): void {
			var taPCB = <HTMLInputElement> document.getElementById("taPCB");
			
			// Update PCB to display multiple processes.
			taPCB.value = "PID:";
			for (var x = 0; x < _PCB.pid.length; x++) {
				taPCB.value = taPCB.value + "\t\t" + _PCB.pid[x];
			}
			// taPCB.value = "PID: \t\t" + pid;
			
			taPCB.value = taPCB.value + "\nPC :";
			for (var x = 0; x < _PCB.pc.length; x++) {
				taPCB.value = taPCB.value + "\t\t" + _PCB.pc[x];
			}
			
			taPCB.value = taPCB.value + "\nIR :";
			for (var x = 0; x < _PCB.ir.length; x++) {
				taPCB.value = taPCB.value + "\t\t" + _PCB.ir[x];
			}
			
			taPCB.value = taPCB.value + "\nACC:";
			for (var x = 0; x < _PCB.acc.length; x++) {
				taPCB.value = taPCB.value + "\t\t" + _PCB.acc[x];
			}
			
			taPCB.value = taPCB.value + "\nX  :";
			for (var x = 0; x < _PCB.x.length; x++) {
				taPCB.value = taPCB.value + "\t\t" + _PCB.x[x];
			}
			
			taPCB.value = taPCB.value + "\nY  :";
			for (var x = 0; x < _PCB.y.length; x++) {
				taPCB.value = taPCB.value + "\t\t" + _PCB.y[x];
			}
			
			taPCB.value = taPCB.value + "\nZ  :";
			for (var x = 0; x < _PCB.z.length; x++) {
				taPCB.value = taPCB.value + "\t\t" + _PCB.z[x];
			}
			
			taPCB.value = taPCB.value + "\nPriority: \t";
			for (var x = 0; x < _PCB.priority.length; x++) {
				taPCB.value = taPCB.value + _PCB.priority[x] + "\t\t";
			}
			
			taPCB.value = taPCB.value + "\nState:";
			for (var x = 0; x < _PCB.state.length; x++) {
				if ((_PCB.state[x] === "terminated") && (x > 0)) {
					taPCB.value = taPCB.value + "\t" + _PCB.state[x];
				} else {
					taPCB.value = taPCB.value + "\t\t" + _PCB.state[x];
				}
			}
			
			taPCB.value = taPCB.value + "\nLocation: \t";
			for (var x = 0; x < _PCB.location.length; x++) {
				taPCB.value = taPCB.value + _PCB.location[x] + "\t\t";
			}
		}
		
		public static initCPU(): void {
			var taCPU = <HTMLInputElement> document.getElementById("taCPU");
			taCPU.value = "PC : \t" + "\nACC: \t" + "\nX  : \t" + "\nY  : \t" + "\nZ  : \t";
		}
		
		public static displayCPU(): void {
			var taCPU = <HTMLInputElement> document.getElementById("taCPU");
			taCPU.value = "PC : \t" + _CPU.PC + "\nACC: \t" + _CPU.Acc + "\nX  : \t" + _CPU.Xreg + "\nY  : \t" + _CPU.Yreg + "\nZ  : \t" + _CPU.Zflag;
		}
		
		public static displayFSDD(): void {
			var taFSDD = <HTMLInputElement> document.getElementById("taFSDD");
			taFSDD.value = "";
			var key = "";
			for (var x = 0; x < 4; x++) {
				for (var y = 0; y < 8; y++) {
					for (var z = 0; z < 8; z++) {
						key = x + "" + y + "" + z;
						if (key !== "000") {
							taFSDD.value = taFSDD.value + key + " " + localStorage.getItem(key) + "\n";
						}
					}
				}
				if (x === 0) {
					taFSDD.value = taFSDD.value + "\n";
				}
			}
		}

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();
			
			// Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // Optionally update a log database or some streaming service.
        }
		
		public static hostTaskBar(): void {
			// Display Status
			var status = _Status;
			
			// Retrieve Date and Time
			var d = Date();
			
			// Update Task Bar
			var taTaskBar = <HTMLInputElement> document.getElementById("taTaskBar");
			taTaskBar.value = "Status: " + status + "\n" + d;
		}
		
		public static extractCode(): string {
			var taProgramInput = <HTMLInputElement> document.getElementById("taProgramInput");
			var code = taProgramInput.value;
			
			return code;
		}
		
		public static fillMemoryCell(instruction, row, cell) {
			// Create id
			var r = row + 1;
			var c = cell + 1;
			var id = "row" + r + "cell" + c;
			
			// Writes new value to cell
			//document.getElementsByTagName('table')[0].getElementsByTagName('td')[cell] = instruction;
			//var memCell = <HTMLInputElement> document.getElementById(id);
			//memCell.value = instruction;
		}

        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();
            _CPU.init();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
    }
}
