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
        // Resets the cpu
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            console.log("Hello world! This is a CPU CYCLE");
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // Need to FETCH the current op code from memory
            // Get the current program counter location, originally set when program is loaded
            var currentOpCode = this.readMemory(this.PC);
            console.log("FLAG 5 " + currentOpCode);
            // Make switch that DECODES the current OP CODE, so we can EXECUTE proper functionality
            // Issue #27
            switch (currentOpCode) { // Mneumonic Code | Description of code
                case "A9": // LDA <constant> | Load a constant into the accumulator
                    // Use helper function to get the following value in memory as a int
                    var constantIntValue = this.getFollowingMemIndexInMemory();
                    // Load the retrieved value into the accumulator
                    this.Acc = constantIntValue;
                    // Update the accumulator value of the current process
                    _PCBInstances[_CurrentPID].Acc = this.Acc;
                    break;
                case "AD": // LDA <memoryAddress> | Load a value from memory into accumulator
                    // Use helper function to get the following address in memory as a int
                    var memoryAddrIndex = this.getFollowingMemIndexInMemory();
                    // Convert the value to a numner
                    var loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Load the retrieved value into the accumulator
                    this.Acc = loadedIntValue;
                    // Update the accumulator value of the current process
                    _PCBInstances[_CurrentPID].Acc = this.Acc;
                    break;
                case "8D": // STA <memoryAddress> | Store the accumulator in memory
                    // Use the helper function to get the following address as an int
                    memoryAddrIndex = this.getFollowingMemIndexInMemory();
                    // Write the accumulator to the specifieid memory address
                    this.writeToMemory(memoryAddrIndex, this.Acc);
                    break;
                case "6D": // ADC <memoryAddress> | Adds content of address in memory to accumulator, stores sum in accumulator
                    // Use helper function to get the memory address load from the following slot in memory
                    memoryAddrIndex = this.getFollowingMemIndexInMemory();
                    // Load the value from memory 
                    loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Add the constant to the accumulator value
                    this.Acc += loadedIntValue;
                    // Update the Accumulator in the PCB
                    _PCBInstances[_CurrentPID].Acc = this.Acc;
                    break;
                case "A2": // LDX <constant> | Load the X register with a constant
                    // Use the faithful helper to load the constant from the following memory address 
                    constantIntValue = this.getFollowingMemIndexInMemory();
                    // Assign the X register the constant value loaded from memory
                    this.Xreg = constantIntValue;
                    // Update the X Register in the current PCB
                    _PCBInstances[_CurrentPID].Xreg = this.Xreg;
                    break;
                case "AE": // LDX <memoryAddress> | Load the X register with a value from memory
                    // Use helper to get the constant from the following memory address to use to load the value from the memory
                    memoryAddrIndex = this.getFollowingMemIndexInMemory();
                    // Load the value from the memory 
                    loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Load the X register with the loaded value
                    this.Xreg = loadedIntValue;
                    // Update the X register in the current PCB
                    _PCBInstances[_CurrentPID].Xreg = this.Xreg;
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
                    // Stop the CPU from continuing to cycle
                    this.isExecuting = false;
                    // Modify the state of the currently executed PCB to Completed
                    _PCBInstances[_CurrentPID].state = "Completed";
                    // SticcOs lets you only execute a program once? I do not know how I feel about that
                    _PCBInstances[_CurrentPID].executable = false;
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
            // Increment the program counter when the cycle is completed
            this.PC++;
            // Increment the PC for the current PCB
            _PCBInstances[_CurrentPID].PC = this.PC;
            // Update the CPU display
            TSOS.Control.updateCPUDisplay(_CPU);
            // Update the PCB display
            TSOS.Control.updatePCBDisplay(_PCBInstances[_CurrentPID]);
        };
        // Helper Function to use the memory manager to access the specified memory and return the op code
        Cpu.prototype.readMemory = function (addr) {
            return _MemoryManager.readFromMemory(addr);
        };
        // Helper function to use the memory manager to write to memory
        // not sure if in future I will have to modify the steps to writing, so abstracting it out here
        Cpu.prototype.writeToMemory = function (addr, valueToWrite) {
            // Ensure value written in HEX into memory
            var hexToWrite = TSOS.Utils.displayHex(valueToWrite);
            // Pass the arguments on to the memory manager
            _MemoryManager.writeToMemory(addr, hexToWrite);
        };
        // Helper function to get the following value in memory in int form
        Cpu.prototype.getFollowingMemIndexInMemory = function () {
            // Get the following address to load the constant from in memory | Increment the program counter
            var constantAddr = ++this.PC;
            // Read the constant value from memory
            var constantStringValue = this.readMemory(constantAddr);
            // Convert the constant to a number
            return parseInt(constantStringValue, 16);
        };
        // Helper function to load a constant number value from memory
        Cpu.prototype.loadConstantFromMemory = function (addr) {
            // Load the constant value from memory
            var loadedStringValue = this.readMemory(addr);
            // Convert the loaded value to an int
            return parseInt(loadedStringValue, 16);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
