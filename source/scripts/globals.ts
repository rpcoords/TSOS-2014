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


//
// Global Variables
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.

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
var memIndex = new Array (32);
memIndex[0] = "000";
memIndex[1] = "008";
memIndex[2] = "010";
memIndex[3] = "018";
memIndex[4] = "020";
memIndex[5] = "028";
memIndex[6] = "030";
memIndex[7] = "038";
memIndex[8] = "040";
memIndex[9] = "048";
memIndex[10] = "050";
memIndex[11] = "058";
memIndex[12] = "060";
memIndex[13] = "068";
memIndex[14] = "070";
memIndex[15] = "078";
memIndex[16] = "080";
memIndex[17] = "088";
memIndex[18] = "090";
memIndex[19] = "098";
memIndex[20] = "0A0";
memIndex[21] = "0A8";
memIndex[22] = "0B0";
memIndex[23] = "0B8";
memIndex[24] = "0C0";
memIndex[25] = "0C8";
memIndex[26] = "0D0";
memIndex[27] = "0D8";
memIndex[28] = "0E0";
memIndex[29] = "0E8";
memIndex[30] = "0F0";
memIndex[31] = "0F8";

// Process IDs
var _PIDCounter = 0;
var _PIDs = null; // Initialized in kernel
var _Process = null; // Initialized when program is executed
var _ProcState = "";

var _MemoryPointer = 0;
var _MemTracker = new Array(3);
for (var a = 0; a <= 2; a++) {
	_MemTracker[a] = false;
}

var memDivision = 0;
var _id = 0;
var _col = 0;
var _row = 0;

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
