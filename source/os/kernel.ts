/* ------------
     Kernel.ts

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

            // Initialize the console.
            _Console = new Console();             // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the file system devivce driver 
            this.krnTrace("Loading the file system device driver.");
            _krnFileSystemDriver = new DeviceDriverFileSystem();
            _krnFileSystemDriver.driverEntry();
            this.krnTrace(_krnFileSystemDriver.status);

            // Issue #45 Initialize global memory variables based on the size of the passed in memory
            _MemoryBlockSize = _Memory.memoryBlockSize;
            _MemoryBlockCount = _Memory.memoryBlockCount

            // Issue #25 Initialize Memory Manager
            _MemoryManager = new TSOS.MemoryManager();
            _MemoryManager.init();

            // Issue #46 initialize Disk object 
            _Disk = new TSOS.Disk();
            
            // Issue #49 | Initialize the HTML Disk display
            TSOS.Control.initDiskDisplay();

            // Issue #42 | Initialize scheduler and dispatcher
            _Scheduler = new TSOS.Scheduler();
            _Dispatcher = new TSOS.Dispatcher();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }

        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                          
            */

            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                // Execute a CPU cycle
                _CPU.cycle();

                // Issue #42 | Invoke the scheduler to check the schedule before exection
                _Scheduler.checkSchedule();
            } else {                       // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }

            // Issue #45 Update the display after each clock tick rather than update it from CPU | Seperation of concerns
            TSOS.Control.updateMemoryDisplay();
            TSOS.Control.updateCPUDisplay();
            TSOS.Control.updatePCBDisplay();
            // Issue #49 update disk display here?
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
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case PRINT_NUM_IRQ:
                    this.krnPrintNumSysCall(params);
                    break;
                case PRINT_STRING_IRQ:
                    this.krnPrintStringSysCall(params);
                    break;
                case CONTEXT_SWITCH_IRQ:
                    _Dispatcher.contextSwitch();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }

        // Issue #45 handles the system call of printing of a number
        public krnPrintNumSysCall(params): void {
            const numToPrint = _CPU.Yreg;
            _StdOut.putText(numToPrint.toString());
        }

        // Issue #45 handles the system call of printing a string
        public krnPrintStringSysCall(params): void {
            // Get the first location of the string to print
            let memoryAddrToPrint = _CPU.Yreg;

            // Get value at the first location in memory
            let opCodeToPrint = _CPU.loadConstantFromMemory(memoryAddrToPrint);

            // Keep track of where to return to after printing the string
            const returnToAddr = _CPU.PC;

            // Set the program counter to the new value in memory
            _CPU.PC = _CPU.Yreg;

            // Loop through Print the characters until the breakpoint is reached 
            while (opCodeToPrint != 0) {
                // Convert non 00 op code to the corresponding char based on ASCII
                let charToPrint = String.fromCharCode(opCodeToPrint);

                // Print the character to the screen
                _StdOut.putText(charToPrint);

                // Get the next op code
                opCodeToPrint = _CPU.getFollowingConstantFromMemory();

            }

            // Done printing, return PC back to after the initial call
            _CPU.PC = returnToAddr;
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
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
            }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            this.krnShutdown();
        }
    }
}
