/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
///<reference path="../host/memoryAccessor.ts" /> 
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // Need to FETCH the current op code from memory
            var currentOpCode = "A6"; // Not exactly sure how to get opcode yet from memory so putting in placeholder
            // Make switch that DECODES the current OP CODE, so we can EXECUTE proper functionality
            // Issue #27
            switch (currentOpCode) { // Mneumonic Code | Description of code
                case "A9": // LDA <constant> | Load a constant into the accumulator
                    // Need to implement the functionality of loading the accumulator with a constant value
                    break;
                case "AD": // LDA <memoryAddress> | Load a value from memory into accumulator
                    // Need to implement the functionality of loading the accumulator with a value from memory
                    break;
                case "8D": // STA <memoryAddress> | Store the accumulator in memory
                    // Need to implement the functionality of storing the accumulator in a specific memory addrtess
                    break;
                case "6D": // ADC <memoryAddress> | Adds content of address in memory to accumulator, stores sum in accumulator
                    // Get the memory address specified in the command
                    // Retrieve the constant
                    // Add the constant to the accumulator value
                    // Save sum in the accumulator (This may be one step with the above comment)
                    break;
                case "A2": // LDX <constant> | Load the X register with a constant
                    // Must implmement this
                    break;
                case "AE": // LDX <memoryAddress> | Load the X register with a value from memory
                    // Yes, I must implement this, and all them. I am just laying out the framework of this switch for now
                    break;
                case "AO": // LDY <constant> | Load the Y register with a constant
                    // Get the constant from the following op code
                    // Load the Y register with the constant
                    break;
                case "AC": // LDY <memoryAddress | Load the Y register with a value from memory
                    // Get the memory address from the following op code
                    // Get the value to load from the memory address
                    // Load the Y register
                    break;
                case "EA": // NOP | No operation
                    // Do nothing?
                    break;
                case "00": // BRK | Break
                    // What to do here?
                    // End execution?
                    break;
                case "EC": // CPX <memoryAddress| Compare a byte in memory to the X register
                    // Get the memory address of the byte to compare
                    // Get the byte to compaer
                    // Compare the retrieved byte to the X register
                    break;
                case "D0": // BNE <lineToBreakTo> | Branch n bytes if Z flag is 0
                    // Determine if the program should go to the line break
                    // Get the line in the program code that the program should break to
                    // Move program counter to the specified line to break to
                    break;
                case "EE": // INC <byteToIncrement> | Increment the value of a byte
                    // Verify byteToIncrement exists
                    // Increment the byte if yes
                    // Tell user byte does not exist if not
                    break;
                case "FF": // SYS | The call parameter is based on the X or Y register 
                    // If there is an 01 in the X register then display the integer in the Y register
                    if (this.Xreg == 1) {
                        // Display the value in the Y register
                    }
                    else if (this.Xreg == 2) {
                    }
                    else {
                        // Throw a software interrupt error, invalid system call in X register
                    }
                    break;
                default:
                    // If the op code does not match any of the valid ones for the system it is invalid
                    break;
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
