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
            // this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // Need to FETCH the current op code from memory
            // Get the current program counter location, originally set when program is loaded
            var currentOpCode = this.readMemory(this.PC);
            console.log("FLAG 5 " + currentOpCode);
            // Initialize variables outside of the switch to prevent unitialized weirdness. 
            var constantIntValue, memoryAddrIndex, loadedIntValue;
            // Make switch that DECODES the current OP CODE, so we can EXECUTE proper functionality
            // Issue #27
            switch (currentOpCode) { // Mneumonic Code | Description of code
                case "A9": // LDA <constant> | Load a constant into the accumulator
                    // Use helper function to get the following value in memory as a int
                    constantIntValue = this.getFollowingConstantFromMemory();
                    // Load the retrieved value into the accumulator
                    this.Acc = constantIntValue;
                    // Update the accumulator value of the current process
                    _PCBInstances[_CurrentPID].Acc = this.Acc;
                    break;
                case "AD": // LDA <memoryAddress> | Load a value from memory into accumulator
                    // Use helper function to get the following address in memory as a int
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();
                    // Convert the value to a numner
                    loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Load the retrieved value into the accumulator
                    this.Acc = loadedIntValue;
                    // Update the accumulator value of the current process
                    _PCBInstances[_CurrentPID].Acc = this.Acc;
                    break;
                case "8D": // STA <memoryAddress> | Store the accumulator in memory
                    // Use the helper function to get the following address as an int
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();
                    // Write the accumulator to the specifieid memory address
                    this.writeToMemory(memoryAddrIndex, this.Acc.toString(16));
                    break;
                case "6D": // ADC <memoryAddress> | Adds content of address in memory to accumulator, stores sum in accumulator
                    // Use helper function to get the memory address load from the following slot in memory
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();
                    // Load the value from memory 
                    loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Add the constant to the accumulator value
                    this.Acc += loadedIntValue;
                    // Update the Accumulator in the PCB
                    _PCBInstances[_CurrentPID].Acc = this.Acc;
                    break;
                case "A2": // LDX <constant> | Load the X register with a constant
                    // Use the faithful helper to load the constant from the following memory address 
                    constantIntValue = this.getFollowingConstantFromMemory();
                    // Assign the X register the constant value loaded from memory
                    this.Xreg = constantIntValue;
                    // Update the X Register in the current PCB
                    _PCBInstances[_CurrentPID].Xreg = this.Xreg;
                    break;
                case "AE": // LDX <memoryAddress> | Load the X register with a value from memory
                    // Use helper to get the constant from the following memory address to use to load the value from the memory
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();
                    // Load the value from the memory 
                    loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Load the X register with the loaded value
                    this.Xreg = loadedIntValue;
                    // Update the X register in the current PCB
                    _PCBInstances[_CurrentPID].Xreg = this.Xreg;
                    break;
                case "A0": // LDY <constant> | Load the Y register with a constant
                    // Get the constant from the following op code with the helper function
                    constantIntValue = this.getFollowingConstantFromMemory();
                    // Load the Y register with the constant
                    this.Yreg = constantIntValue;
                    // Update the Y register in the PCB
                    _PCBInstances[_CurrentPID].Yreg = this.Yreg;
                    break;
                case "AC": // LDY <memoryAddress | Load the Y register with a value from memory
                    // Get the memory address from the following op code
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();
                    // Get the value to load from the memory address
                    loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Load the Y register
                    this.Yreg = loadedIntValue;
                    // Update the Y register in the PCB
                    _PCBInstances[_CurrentPID].Yreg = this.Yreg;
                    break;
                case "EA": // NOP | No operation
                    // Do nothing? The program counter is incremented down below
                    break;
                case "00": // BRK | Break
                    // Modify the state of the currently executed PCB to Completed
                    _PCBInstances[_CurrentPID].state = "COMPLETED";
                    // SticcOs lets you only execute a program once
                    _PCBInstances[_CurrentPID].executable = false;
                    // Get the memory segment used by the current processes to free it up
                    var segmentToFree = _PCBInstances[_CurrentPID].memSegment;
                    // #35 set the mem segment to being free so a new process can be laoded
                    _MemoryManager.partitions[segmentToFree].isFree = true;
                    // Issue #42 | Throw interrupt to check the schedule to load next program or stop execution
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, []));
                    // _Scheduler.checkScheduleOnProcessCompletion(_PCBInstances[_CurrentPID]);
                    break;
                case "EC": // CPX <memoryAddress| Compare a byte in memory to the X register
                    // Get the memory address of the byte to 
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();
                    // Get the byte to compare to the X register
                    constantIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Compare the retrieved byte to the X register
                    if (this.Xreg == constantIntValue) {
                        // Set Z flag to 1 if equal
                        this.Zflag = 1;
                    }
                    else {
                        // Set Z flag to 0 if not equal
                        this.Zflag = 0;
                    }
                    // Update the Z flag in the PCB 
                    _PCBInstances[_CurrentPID].ZFlag = this.Zflag;
                    break;
                case "D0": // BNE <lineToBreakTo> | Branch n bytes if Z flag is 0
                    // Determine if the program should go to the line break
                    if (this.Zflag == 0) {
                        // Get the amount of lines to break
                        var amountToBreak = this.getFollowingConstantFromMemory();
                        // Increment the PC based on the input
                        this.PC += amountToBreak;
                        // Check if wraparound is required
                        if (this.PC > _MemoryBlockSize) {
                            // If the program counter is bigger than the memory block size, set the PC to the amount it goes over
                            var wraparound = this.PC % _MemoryBlockSize;
                            // Assign the wrapound value as the Program Coutner
                            this.PC = wraparound;
                        }
                        // Update the PC in the PCB
                        _PCBInstances[_CurrentPID].PC = this.PC;
                    }
                    else {
                        // If the Z Flag is not zero, just continue execution, but skip the argument that otherwise tell where to move to
                        this.PC++;
                    }
                    // Move program counter to the specified line to break to
                    break;
                case "EE": // INC <byteToIncrement> | Increment the value of a byte
                    // Verify byteToIncrement exists | Does this need to be done for all memory calls?
                    // Get the memory address for the byte to increment
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();
                    // Get the value of the specified memory address 
                    loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);
                    // Increment the value by one
                    var incrementedValue = loadedIntValue + 1;
                    // Write the new, incremented value into memory
                    this.writeToMemory(memoryAddrIndex, incrementedValue.toString(16));
                    break;
                case "FF": // SYS | The call parameter is based on the X or Y register 
                    // If there is an 01 in the X register then display the integer in the Y register
                    if (this.Xreg == 1) {
                        // #45 Create a software interrupt to handle the system call | Seperate structure from presentation
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_NUM_IRQ, []));
                    }
                    // Print 00 teriminated string starting at address sepcified in the Y register 
                    else if (this.Xreg == 2) {
                        // #45 Create a software intterupt to handle the system call | Seperate structure from presentation
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_STRING_IRQ, []));
                    }
                    else {
                        // Throw a software interrupt error, invalid system call in X register
                        // Kill the current process... change state to failed?
                    }
                    break;
                default:
                    // If the op code does not match any of the valid ones for the system it is invalid
                    // Terminate the process
                    TSOS.ProcessControlBlock.killProcess(_PCBInstances[_CurrentPID]);
                    break;
            }
            // Increment the program counter when the cycle is completed
            this.PC++;
            // Increment the PC for the current PCB
            _PCBInstances[_CurrentPID].PC = this.PC;
        };
        // Helper Function to use the memory manager to access the specified memory and return the op code
        Cpu.prototype.readMemory = function (logicalAddess) {
            // Get the memsegment to read from based on the current PCB
            var memSegment = _PCBInstances[_CurrentPID].memSegment;
            return _MemoryAccessor.readFromMemory(logicalAddess, memSegment);
        };
        // Helper function to use the memory manager to write to memory
        // not sure if in future I will have to modify the steps to writing, so abstracting it out here
        Cpu.prototype.writeToMemory = function (logicalAddress, valueToWrite) {
            // Trim the white space from the value to write
            var trimmedValueToWriteString = valueToWrite.trim();
            // Parse trimmed value as an int
            var trimmedValueToWriteInt = parseInt(trimmedValueToWriteString, 16);
            // Ensure value written in HEX into memory
            var hexToWrite = TSOS.Utils.displayHex(trimmedValueToWriteInt);
            // Get the memsegment to read from based on the current PCB
            var memSegment = _PCBInstances[_CurrentPID].memSegment;
            // Pass the arguments on to the memory manager
            _MemoryAccessor.writeToMemory(logicalAddress, memSegment, hexToWrite);
        };
        // Helper function to get the following constant in memory in int form
        Cpu.prototype.getFollowingConstantFromMemory = function () {
            // Get the following address to load the constant from in memory | Increment the program counter
            var logicalAddress = ++this.PC;
            // Read the constant value from memory
            var constantStringValue = this.readMemory(logicalAddress);
            // Convert the constant to a number
            return parseInt(constantStringValue, 16);
        };
        // Helper function to load a constant number value from memory
        Cpu.prototype.loadConstantFromMemory = function (logicalAddress) {
            // Load the constant value from memory
            var loadedStringValue = this.readMemory(logicalAddress);
            // Convert the loaded value to an int
            return parseInt(loadedStringValue, 16);
        };
        // Helper function to get following memory location which consists of two blocks of memory
        Cpu.prototype.getFollowingMemoryLocationFromMemory = function () {
            // Get the following memory address as a string, second half of memory address 
            var secondHalfMemAddr = this.getFollowingConstantFromMemory().toString();
            // Get the memory address as a string after that, front half of memory address
            var firstHalfMemAddr = this.getFollowingConstantFromMemory().toString();
            // Combine memory addresses
            var fullMemAddrString = firstHalfMemAddr + secondHalfMemAddr;
            // Convert memory address to int
            var logicalAddress = parseInt(fullMemAddrString);
            // Return them the full memory address
            return logicalAddress;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
