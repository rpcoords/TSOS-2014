/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
  
//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScraipt.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME: string    = "S.O.S.";   // 'cause Bob and I were at a loss for a better name.
var APP_VERSION: string = "6.13";   // What did you expect?

var CPU_CLOCK_INTERVAL: number = 100;   // This is in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                            // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ: number = 1;
var MEMORY_BOUNDS_IRQ: number = 2;


//
// Global Variables
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Scheduler: TSOS.Scheduler;

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement = null;  // Initialized in hostInit().
var _DrawingContext = null;             // Initialized in hostInit().
var _DefaultFontFamily = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;              // Additional space added to font size when advancing a line.

var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers: any[] = null;
var _KernelInputQueue = null;

// Memory Queue
var _Memory = null;

var memory = new Array(32);
var memIndex = new Array (96);
memIndex[0] = "000";
memIndex[1] = "010";
memIndex[2] = "020";
memIndex[3] = "030";
memIndex[4] = "040";
memIndex[5] = "050";
memIndex[6] = "060";
memIndex[7] = "070";
memIndex[8] = "080";
memIndex[9] = "090";
memIndex[10] = "0A0";
memIndex[11] = "0B0";
memIndex[12] = "0C0";
memIndex[13] = "0D0";
memIndex[14] = "0E0";
memIndex[15] = "0F0";
memIndex[16] = "100";
memIndex[17] = "110";
memIndex[18] = "120";
memIndex[19] = "130";
memIndex[20] = "140";
memIndex[21] = "150";
memIndex[22] = "160";
memIndex[23] = "170";
memIndex[24] = "180";
memIndex[25] = "190";
memIndex[26] = "1A0";
memIndex[27] = "1B0";
memIndex[28] = "1C0";
memIndex[29] = "1D0";
memIndex[30] = "1E0";
memIndex[31] = "1F0";
memIndex[32] = "200";
memIndex[33] = "210";
memIndex[34] = "220";
memIndex[35] = "230";
memIndex[36] = "240";
memIndex[37] = "250";
memIndex[38] = "260";
memIndex[39] = "270";
memIndex[40] = "280";
memIndex[41] = "290";
memIndex[42] = "2A0";
memIndex[43] = "2B0";
memIndex[44] = "2C0";
memIndex[45] = "2D0";
memIndex[46] = "2E0";
memIndex[47] = "2F0";

// Process IDs
var _PIDCounter = 0;
var _PIDs = null; // Initialized in kernel
var _Process = null; // Initialized when program is executed
var _Priorities = null; // Priority values loaded in.

//_Process = TSOS.Process;
var _ProcState = "";
var _Actives = new Array(); // All PIDs that are active.
var _PCB: TSOS.ProcessRegisters;

var _MemoryPointer = 0;
var _MemTracker = new Array(3);
for (var a = 0; a <= 2; a++) {
	_MemTracker[a] = false;
}

var memDivision = 0;
var _id = 0;
var _col = 0;
var _row = 0;

// Units of time per loaded command (not yet run)
var _Units = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// Status
var _Status: string = "running";

// Stacks
var _BuffStack = null;
var _InverseStack = null;
var _StringStack = null;

// Scrolling Queue
var _ScrollQueue = null;

// Stops kernel if crash
var _Crash = false;

// Quantum (used for Round Robin execution)
var _Quantum = 6;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID: number = null;

// For testing...
var _GLaDOS: any = null;
var Glados: any = null;

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
