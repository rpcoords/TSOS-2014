///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {

        }

        public init() {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
			
			// whereami
			sc = new ShellCommand(this.shellWhereami, 
								  "whereami", 
								  "- Tells you where you are.");
			this.commandList[this.commandList.length] = sc;
			
			// rese
			sc = new ShellCommand(this.shellRese,
								  "rese", 
								  "- S.O.S. gives its opinion of a Resident Evil game whose title includes a number between 0 and 6.");
			this.commandList[this.commandList.length] = sc;
			
			// date
			sc = new ShellCommand(this.shellDate, 
								  "date", 
								  "- Displays the current date and time.");
			this.commandList[this.commandList.length] = sc;
			
			// status <string>
			sc = new ShellCommand(this.shellStatus, 
								  "status", 
								  "<string> - Allows user to specify status messages.");
			this.commandList[this.commandList.length] = sc;
			
			// bsod
			sc = new ShellCommand(this.shellBsod, 
								  "bsod", 
								  "- Crashes S.O.S.");
			this.commandList[this.commandList.length] = sc;
			
			// load
			sc = new ShellCommand(this.shellLoad,
								  "load",
								  "- Loads user code into memory.");
			this.commandList[this.commandList.length] = sc;
			
			// run <pid>
			sc = new ShellCommand(this.shellRun,
								  "run",
								  "<pid> - Runs program for specified pid.");
			this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
			Control.hostLog("shell launched", "shell");
        }

        public putPrompt() {
			_StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
            userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer) {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
		
		public shellWhereami() {
			_StdOut.putText("I don't know. Why are you asking me?");
		}

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
		
		public shellRese(args) {
			if (args < 5) {
				_StdOut.putText("It's a classic game. You should play it.");
			} else if (args < 6) {
				_StdOut.putText("It's alright, but not as good as the originals.");
			} else {
				_StdOut.putText("Avoid like the plague!");
			}
		}
		
		public shellDate() {
			_StdOut.putText(Date());
		}
		
		public shellStatus(args) {
			_Status = args;
		}
		
		public shellBsod(args) {
			_Kernel.krnTrapError("controlled crash");
		}
		
		public shellLoad() {
			var code = Control.extractCode();
			var instruction = "";
			var invalid = false;
			var currA = 0;
			var currB = 0;
			var memLocationA = 0;
			var memLocationB = 0;
			
			if (_MemoryPointer === 1) {
				currA = 32;
			} else if (_MemoryPointer === 2) {
				currA = 64;
			}
			
			for (var a = 0; a <= code.length - 1; a++) {
				var letter = code.charAt(a);
				
				// Remove spaces and check for valid characters.
				if (letter === " ") {
				} else if ((letter === "1") || (letter === "2") || (letter === "3") || (letter === "4") || (letter === "5") || 
						   (letter === "6") || (letter === "7") || (letter === "8") || (letter === "9") || (letter === "0") ||
						   (letter === "A") || (letter === "B") || (letter === "C") || (letter === "D") || (letter === "E") || (letter === "F")) {
					instruction = instruction + letter;
				} else {
					_StdOut.putText("Invalid Character: " + letter);
					_StdOut.advanceLine();
					_StdOut.putText("Use only hexadecimal characters.");
					invalid = true;
					break;
				}
				
				if (instruction.length === 2) {
					// Push instruction into memory.
					_Memory[_MemoryPointer][memLocationA][memLocationB] = instruction;
					memLocationB++;
					if (memLocationB === 16) {
						memLocationA++;
						memLocationB = 0;
					}
					
					// Load instruction into visual memory.
					memory[currA][currB] = instruction;
					
					currB++;
					if (currB === 8) {
						currB = 0;
						currA++;
					}
					
					instruction = "";
				}
			}
			
			if (invalid === false) {
				// Display memory in UI.
				Control.fillMemory();
				
				// Create PID
				_PIDs.enqueue([_PIDCounter, _MemoryPointer]);
				
				_MemTracker[_MemoryPointer] = true;
				if (_MemTracker[0] === false) {
					_MemoryPointer = 0;
				} else if (_MemTracker[1] === false) {
					_MemoryPointer = 1;
				} else {
					_MemoryPointer = 2;
				}
				
				// Display PID in shell.
				_StdOut.putText("PID: " + _PIDCounter);
				_PIDCounter++; // Increment _PIDCounter for next program.
			}
		}
		
		public shellRun(args) {
			var id = _PIDs.dequeue();
			var pointer = 0;
			while (pointer < 3) {
				if (+args === id[0]) {
					break;
				} else {
					_PIDs.enqueue(id);
					id = _PIDs.dequeue();
					pointer++;
				}
			}
			
			if (pointer === 3) {
				_StdOut.putText(pointer + "No such PID.");
			} else {
				_Process = new Process(+args, "0", _CPU, 1, "new");
				_ProcState = "new";
				Control.displayPCB(args, "0", 1);
				_StdOut.putText("almost there: " + id[1]);
				_CPU.executeProgram(id[1], args);
			}
			_StdOut.putText("\nLeaving function.");
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
