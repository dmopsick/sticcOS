/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
var APP_NAME = "SticcOS"; // My nickname is Sticc
var APP_VERSION = "0.22";
var CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
// Issue #45 create ISR numbers for the printing of numbers and strings | Seperate structure from presentation
var PRINT_NUM_IRQ = 2; // Handles the X register 1 | printing of numbers
var PRINT_STRING_IRQ = 3; // Handles the X register 2 | printing of strings
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
// Issue #42 | Quantum values used for CPU scheduling
var _DefaultQuantum = 6;
var _Scheduler;
var _Dispatcher;
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelInputQueue = null;
var _KernelBuffers = null;
// Standard input and output
var _StdIn = null;
var _StdOut = null;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
// Memory 
var _MemoryBlockSize; // Issue #24 | Keeps track of the size of a single memory block in the system
var _MemoryBlockCount; // Issue #24 | Keeps track of the amount of memory blocks present in the system
var _Memory;
var _MemoryAccessor;
var _MemoryManager = null;
// Process Control Block
var _PCBInstances = new Array();
var _CurrentPID; // Issue #21 keeps track of the current PID that is being executed
var _NextPID = 0; // Issue #21 keeps track of the next PID to assign to PIDs as they are created to prevent repeated numbers
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
