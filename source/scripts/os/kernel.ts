///<reference path="stack.ts" />

/* ------------
     Kernel.ts

     Requires globals.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
			_KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _Console = new Console();          // The command line interface / console I/O device.

            // Initialize the console.
            _Console.init();
			
			// Initializes Memory
			_Memory = new Array(3);
			for (var a = 0; a <= 2; a++) {
				_Memory[a] = new Array(16);
				for (var b = 0; b <= 15; b++) {
					_Memory[a][b] = new Array(16);
				}
			}
			
			for (var a = 0; a <= 2; a++) {
				for (var b = 0; b <= 15; b++) {
					for (var c = 0; c <= 15; c++) {
						_Memory[a][b][c] = "00";
					}
				}
			}
			
			var _MemoryLength = _Memory.length*(_Memory[0][0].length+_Memory[0].length)
			// Initialize _Scheduler
			_Scheduler = new Scheduler();
			// Initialize _PCB
			_PCB = new ProcessRegisters();
			
			// Initialize stacks and _ScrollQueue
			_BuffStack = new Queue();
			_InverseStack = new Queue();
			_StringStack = new Queue();
			_ScrollQueue = new Queue();
			_PIDs = new Queue();
			_Units = new Queue();
			_Priorities = new Queue();
			_MemoryPIDs = new Queue();
			
            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
			
			// Load File System Device Driver
			this.krnTrace("Loading the file system device driver.");
			_krnFileSysDriver = new DeviceDriverFileSystem();
			_krnFileSysDriver.driverEntry();
			this.krnTrace(_krnFileSysDriver.status);
			
			_krnFileSysDriver.format();

            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
			while (1 < 2) { }
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
			
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                // Make context switches sensitive to scheduler algorithm.
				// Implements Round Robin, First Come, First Served, and Non-Preemptive Priority scheduling with _Scheduler.
				if (_Scheduler.algorithm === "rr") {
					if (_Scheduler.remainingUnits === 0) {
						_Scheduler.contextSwitch();
					}
				} else { // Used for First Come, First Served and Priority
					// if (readyForSwitch = true), execute context switch.
					if (_Scheduler.readyForSwitch === true) {
						_Scheduler.contextSwitch();
					}
				}
				console.log("id: " + _id)
				
				_CPU.cycle();
				_Scheduler.onCycle(); // Decrement remaining time units.
            } else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                if (_Crash === false) {
					Control.displayFSDD();
					this.krnTrace("Idle");
				}
            }
			
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
				case MEMORY_BOUNDS_IRQ:
					this.krnTrace("Memory Out of Bounds exception.");
					_OsShell.shellKill(_id);
					break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
						Control.hostTaskBar();
                    }
                } else {
					Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
			_Crash = true;
            // TODO: Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
			_OsShell.shellCls(msg);
			_DrawingContext.fillStyle = "rgb(0,0,200)";
			_DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
			_Console.putText("SYSTEM CRASH");
			_Console.advanceLine();
			_Console.putText("Please restart.");
            this.krnShutdown();
        }
    }
}
