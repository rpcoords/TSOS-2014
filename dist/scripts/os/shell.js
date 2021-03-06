///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
///<reference path="scheduler.ts" />
/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc = null;

            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Tells you where you are.");
            this.commandList[this.commandList.length] = sc;

            // rese
            sc = new TSOS.ShellCommand(this.shellRese, "rese", "- S.O.S. gives its opinion of a Resident Evil game whose title includes a number between 0 and 6.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Allows user to specify status messages.");
            this.commandList[this.commandList.length] = sc;

            // bsod
            sc = new TSOS.ShellCommand(this.shellBsod, "bsod", "- Crashes S.O.S.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "<priority> - Loads user code into memory (<priority> is optional. Default value is 1).");
            this.commandList[this.commandList.length] = sc;

            // run <pid>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Runs program for specified pid.");
            this.commandList[this.commandList.length] = sc;

            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - Allows user to change quantum value.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", "- clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- display PIDs for all active processes.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new TSOS.ShellCommand(this.shellRunall, "runall", "- executes all programs in memory at once.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - kills process with specified pid.");
            this.commandList[this.commandList.length] = sc;

            // create <filename>
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<filename> - creates file filename.");
            this.commandList[this.commandList.length] = sc;

            // read <filename>
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<filename> - displays contents of file filename.");
            this.commandList[this.commandList.length] = sc;

            // write <filename> "data"
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<filename> \"data\" - writes data to file filename.");
            this.commandList[this.commandList.length] = sc;

            // delete <filename>
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<filename> - remove file filename from storage.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- initializes the file system device driver.");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "- lists all files stored on disk.");
            this.commandList[this.commandList.length] = sc;

            // setschedule [rr, fcfs, priority]
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "[rr, fcfs, priority] - changes cpu scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- returns currently selected cpu scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
            TSOS.Control.hostLog("shell launched", "shell");
        };

        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);

            //
            // Parse the input...
            //
            var userCommand = new TSOS.UserCommand();
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
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                } else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
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
        };

        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();

            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };

        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };

        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Okay. I forgive you. This time.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        };

        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };

        Shell.prototype.shellWhereami = function () {
            _StdOut.putText("I don't know. Why are you asking me?");
        };

        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };

        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");

            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };

        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };

        Shell.prototype.shellMan = function (args) {
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
        };

        Shell.prototype.shellTrace = function (args) {
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
        };

        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellRese = function (args) {
            if (args < 5) {
                _StdOut.putText("It's a classic game. You should play it.");
            } else if (args < 6) {
                _StdOut.putText("It's alright, but not as good as the originals.");
            } else {
                _StdOut.putText("Avoid like the plague!");
            }
        };

        Shell.prototype.shellDate = function () {
            _StdOut.putText(Date());
        };

        Shell.prototype.shellStatus = function (args) {
            _Status = args;
        };

        Shell.prototype.shellBsod = function (args) {
            _Kernel.krnTrapError("controlled crash");
        };

        Shell.prototype.shellLoad = function (args) {
            var code = TSOS.Control.extractCode();
            var instruction = "";
            var invalid = false;
            var currA = 0;
            var currB = 0;
            var memLocationA = 0;
            var memLocationB = 0;
            var bytesPassed = 0;
            var units = 0;
            var noPartition = false;
            var program = "";

            //<<<<<<< HEAD
            var priority = 1;

            if (+args.length === 0) {
            } else {
                priority = +args;
            }

            //=======
            //>>>>>>> 8f5be46f6b6a07b6c705d225a142a2841729a641
            if (_MemoryPointer === 1) {
                currA = 32;
            } else if (_MemoryPointer === 2) {
                currA = 64;
            } else if (_MemoryPointer === 3) {
                noPartition = true;
            }

            if (code === "") {
                _StdOut.putText("No program to load into memory.");
                invalid = true;
            } else if (noPartition === true) {
                //_StdOut.putText("Cannot load program into memory. Partitions full.");
                //invalid = true;
                //code = "";
            }

            for (var a = 0; a <= code.length - 1; a++) {
                var letter = code.charAt(a);

                // Remove spaces and check for valid characters.
                if (letter === " ") {
                } else if ((letter === "1") || (letter === "2") || (letter === "3") || (letter === "4") || (letter === "5") || (letter === "6") || (letter === "7") || (letter === "8") || (letter === "9") || (letter === "0") || (letter === "A") || (letter === "B") || (letter === "C") || (letter === "D") || (letter === "E") || (letter === "F")) {
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
                    if (noPartition === false) {
                        _Memory[_MemoryPointer][memLocationA][memLocationB] = instruction;
                        memLocationB++;
                        if (memLocationB === 16) {
                            memLocationA++;
                            memLocationB = 0;
                        }
                    } else {
                        console.log("program updated");
                        program = program + instruction;
                    }

                    // Record units in _Units
                    // Determine if instruction is an op code
                    if (bytesPassed === 0) {
                        // Increment units
                        if ((instruction === "EA") || (instruction === "00") || (instruction === "FF")) {
                            units++;
                            bytesPassed = 0;
                        } else if ((instruction === "A9") || (instruction === "A2") || (instruction === "A0")) {
                            units++;
                            bytesPassed = 1;
                        } else if ((instruction === "AD") || (instruction === "8D") || (instruction === "6D") || (instruction === "AE") || (instruction === "AC") || (instruction === "EC") || (instruction === "EE")) {
                            units++;
                            bytesPassed = 2;
                        }
                    } else {
                        bytesPassed--;
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
                // Create PID
                _PIDs.enqueue([_PIDCounter, _MemoryPointer]);

                // Store Process Priority.
                _Priorities.enqueue(priority);

                _MemTracker[_MemoryPointer] = true;
                if (_MemTracker[0] === false) {
                    _MemoryPointer = 0;
                    _MemoryPIDs.enqueue(_PIDCounter);
                } else if (_MemTracker[1] === false) {
                    _MemoryPointer = 1;
                    _MemoryPIDs.enqueue(_PIDCounter);
                } else if (_MemTracker[2] === false) {
                    _MemoryPointer = 2;
                    _MemoryPIDs.enqueue(_PIDCounter);
                } else {
                    _MemoryPointer = 3;
                }

                if (noPartition === false) {
                    TSOS.Control.fillMemory();
                } else {
                    var name = "*p" + _PIDCounter;
                    _krnFileSysDriver.krnFileSysISR(2, name, "");

                    for (var a = program.length; a < 512; a++) {
                        program = program + "0";
                    }
                    console.log(program);
                    _krnFileSysDriver.krnFileSysISR(3, name, program);
                }

                // Display PID in shell.
                _StdOut.putText("PID: " + _PIDCounter);
                _PIDCounter++; // Increment _PIDCounter for next program.

                // Add units to _Units.
                _Units.enqueue(units);
            }
        };

        Shell.prototype.shellRun = function (args) {
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
                _StdOut.putText("No such PID.");
            } else {
                // Modification for CPU Scheduler
                // Determine number of time units for process being added.
                var units = _Units.q[pointer];

                _Actives.push(args);

                // Push to PCB
                var prior = 1;
                for (var x = 0; x <= pointer; x++) {
                    prior = _Priorities.dequeue();
                    if (x !== pointer) {
                        _Priorities.enqueue(prior);
                    }
                }

                // Determine location of process.
                var loc = "Disk";
                for (var x = 0; x < _MemoryPIDs.q.length; x++) {
                    if (+args === +_MemoryPIDs.q[x]) {
                        loc = "Memory";
                        _MemoryPIDs.q.splice(x, 1);
                        break;
                    }
                }

                _PCB.setRegisters(args, prior, loc);
                _Scheduler.addProcess(args, units, id[1], prior);

                _MemTracker[id[1]] = false;
                _MemoryPointer = id[1];

                if (_Scheduler.algorithm !== "rr") {
                    _Scheduler.readyForSwitch = true;
                }
                _CPU.isExecuting = true;
            }
        };

        Shell.prototype.shellQuantum = function (args) {
            _Quantum = args;
            _StdOut.putText("New quantum value: " + args);
        };

        Shell.prototype.shellClearmem = function () {
            for (var a = 0; a <= 2; a++) {
                for (var b = 0; b <= 15; b++) {
                    for (var c = 0; c <= 15; c++) {
                        _Memory[a][b][c] = "00";
                    }
                }
            }

            _MemoryPointer = 0;
            for (var a = 0; a <= 2; a++) {
                _MemTracker[a] = false;
            }

            // Clears memory displayed.
            TSOS.Control.clearMemory();
        };

        Shell.prototype.shellPS = function () {
            _StdOut.putText("Active Processes: ");

            for (var a = 0; a < _Actives.length; a++) {
                var id = _Actives[a];
                _StdOut.putText(id + "");

                // if a != length, add "; ".
                if (a === (_Actives.length - 1)) {
                } else {
                    _StdOut.putText("; ");
                }
                //_PIDs.enqueue(id);
            }
        };

        Shell.prototype.shellRunall = function () {
            if (_CPU.isExecuting === false) {
                _CurrDivision = 2;
            }

            // Add every process to Ready Queue
            var size = _PIDs.getSize();
            for (var a = 0; a < size; a++) {
                var id = _PIDs.dequeue();
                var prior = _Priorities.dequeue();
                var units = _Units.dequeue();

                _Scheduler.addProcess(id[0], units, id[1], prior);
                _Actives.push(id[0]);

                // Determine if in memory
                var loc = "Disk";
                for (var x = 0; x < _MemoryPIDs.q.length; x++) {
                    if (+id[0] === +_MemoryPIDs.q[x]) {
                        loc = "Memory";
                        _MemoryPIDs.q.splice(x, 1);
                        break;
                    }
                }

                // Push to PCB
                _PCB.setRegisters(id[0], prior, loc);
                TSOS.Control.displayPCB(id[0], "0", 1);

                _MemTracker[id[1]] = false;
                _MemoryPointer = id[1];
            }

            if (_Scheduler.algorithm !== "rr") {
                _Scheduler.readyForSwitch = true;
            }
            _CPU.isExecuting = true;
        };

        Shell.prototype.shellKill = function (args_input) {
            // Check if args is in _Actives.
            var args = +args_input;
            var inActives = false;
            for (var x = 0; x < _Actives.length; x++) {
                if (+_Actives[x] === +args) {
                    inActives = true;
                    break;
                }
            }

            if (inActives === false) {
                _StdOut.putText("PID " + args + " is not an active process.");
            } else {
                // Remove from _Actives.
                console.log("input " + args);
                console.log("index of " + _Actives.indexOf(+args));
                _Actives.splice(_Actives.indexOf(args), 1);

                for (var b = 0; b < _PCB.pid.length; b++) {
                    if (+_PCB.pid[b] === +args) {
                        _PCB.pid.splice(b, 1);
                        _PCB.ir.splice(b, 1);
                        _PCB.pc.splice(b, 1);
                        console.log(_PCB.acc);
                        _PCB.acc.splice(b, 1);
                        console.log(_PCB.acc);
                        _PCB.x.splice(b, 1);
                        _PCB.y.splice(b, 1);
                        _PCB.z.splice(b, 1);
                        _PCB.priority.splice(b, 1);
                        _PCB.state.splice(b, 1);
                        break;
                    }
                }

                // Remove from CPU Scheduler.
                _Scheduler.remove(args);
                console.log("scheduler removed");

                _StdOut.putText("Process " + args + " successfully killed.");
            }
        };

        Shell.prototype.shellSetSchedule = function (args) {
            if (_CPU.isExecuting === true) {
                _StdOut.putText("Cannot change scheduling algorithm while CPU is executing.");
            } else {
                _Scheduler.algorithm = args + "";
                _StdOut.putText("New Scheduler Algorithm: " + args);
            }
        };

        Shell.prototype.shellGetSchedule = function () {
            var alg = "";
            _StdOut.putText(_Scheduler.algorithm);
            _StdOut.advanceLine();
            if (_Scheduler.algorithm === "rr") {
                alg = "Round Robin";
            } else if (_Scheduler.algorithm === "fcfs") {
                alg = "First Come, First Served";
            } else {
                alg = "Priority";
            }

            _StdOut.putText("Scheduling Algorithm: " + alg);
        };

        Shell.prototype.shellFormat = function () {
            _krnFileSysDriver.krnFileSysISR(1, "", "", true);
        };

        Shell.prototype.shellCreate = function (args) {
            var ar = args + "";

            if (ar.length > 30) {
                _StdOut.putText("Filename has too many characters.");
            } else {
                _krnFileSysDriver.krnFileSysISR(2, ar, "", true);
            }
        };

        Shell.prototype.shellWrite = function (args) {
            var filename = args[0];
            var data = args[1];

            if ((data.charAt(0) === "\"") && (data.charAt(data.length - 1) === "\"")) {
                data = data.substring(1, data.length - 1);
                _krnFileSysDriver.krnFileSysISR(3, filename, data, true);
            } else {
                _StdOut.putText("Data must be surrounded by quotes.");
            }
        };

        Shell.prototype.shellRead = function (args) {
            var ar = args + "";

            _krnFileSysDriver.krnFileSysISR(4, ar, "", true);
        };

        Shell.prototype.shellDelete = function (args) {
            var ar = args + "";
            _krnFileSysDriver.krnFileSysISR(5, ar, "", true);
        };

        Shell.prototype.shellLs = function () {
            _krnFileSysDriver.krnFileSysISR(6, "", "", true);
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
