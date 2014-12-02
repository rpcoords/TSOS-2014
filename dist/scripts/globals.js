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
var APP_NAME = "S.O.S.";
var APP_VERSION = "6.13";

var CPU_CLOCK_INTERVAL = 100;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var MEMORY_BOUNDS_IRQ = 2;

//
// Global Variables
//
var _CPU;
var _Scheduler;

var _OSclock = 0;

var _Mode = 0;

var _Canvas = null;
var _DrawingContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Memory Queue
var _Memory = null;

var memory = new Array(32);
var memIndex = new Array(96);
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
var _PIDs = null;
var _Process = null;
var _Priorities = null;

//_Process = TSOS.Process;
var _ProcState = "";
var _Actives = new Array();
var _PCB;

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
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// Status
var _Status = "running";

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
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
