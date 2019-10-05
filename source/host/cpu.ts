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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
            public isExecuting: boolean = false) {

        }

        // Resets the cpu
        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            // Need to FETCH the current op code from memory
            // Get the current program counter location, originally set when program is loaded
            const currentOpCode = this.readMemory(this.PC);

            console.log("FLAG 5 " + currentOpCode);

            // Make switch that DECODES the current OP CODE, so we can EXECUTE proper functionality
            // Issue #27
            switch (currentOpCode) { // Mneumonic Code | Description of code
                case "A9":  // LDA <constant> | Load a constant into the accumulator
                    // Use helper function to get the following value in memory as a int
                    let constantIntValue = this.getFollowingConstantFromMemory();

                    // Load the retrieved value into the accumulator
                    this.Acc = constantIntValue;

                    // Update the accumulator value of the current process
                    _PCBInstances[_CurrentPID].Acc = this.Acc

                    break;
                case "AD": // LDA <memoryAddress> | Load a value from memory into accumulator
                    // Use helper function to get the following address in memory as a int
                    let memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();

                    // Convert the value to a numner
                    let loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);

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
                    _PCBInstances[_CurrentPID].Acc = this.Acc

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
                    this.Yreg = constantIntValue

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
                    // Stop the CPU from continuing to cycle
                    this.isExecuting = false;

                    // Modify the state of the currently executed PCB to Completed
                    _PCBInstances[_CurrentPID].state = "Completed"
                    // SticcOs lets you only execute a program once? I do not know how I feel about that
                    _PCBInstances[_CurrentPID].executable = false;
                    break;
                case "EC": // CPX <memoryAddress| Compare a byte in memory to the X register
                    // Get the memory address of the byte to 
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();

                    // Get the byte to compare to the X register
                    constantIntValue = this.loadConstantFromMemory(memoryAddrIndex);

                    console.log("COMPARING " + constantIntValue + " to " + this.Xreg);
                    // Compare the retrieved byte to the X register
                    if (this.Xreg == constantIntValue) {
                        // Set Z flag to 0 if equal
                        this.Zflag = 0;
                    }
                    else {
                        // Set Z flag to 1 if not equal
                        this.Zflag = 1
                    }

                    // Update the Z flag in the PCB 
                    _PCBInstances[_CurrentPID].ZFlag = this.Zflag;

                    break;
                case "D0": // BNE <lineToBreakTo> | Branch n bytes if Z flag is 0
                    console.log("CHECKING FOR BREAK with Z of " + this.Zflag);
                    // Determine if the program should go to the line break
                    if (this.Zflag == 0) {
                        console.log("Time to break!");
                        // Get the line to break to from the next value in memory
                        let lineToBreakTo = this.getFollowingConstantFromMemory();

                        // Set the retrieved value as the program counter
                        this.PC = lineToBreakTo;

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
                    // Verify byteToIncrement exists 
                    
                    // Get the memory address for the byte to increment
                    memoryAddrIndex = this.getFollowingMemoryLocationFromMemory();

                    // Get the value of the specified memory address 
                    loadedIntValue = this.loadConstantFromMemory(memoryAddrIndex);

                    // Increment the value by one
                    const incrementedValue = loadedIntValue++;

                    // Write the new, incremented value into memory
                    this.writeToMemory(memoryAddrIndex, incrementedValue.toString(16));

                    break;
                case "FF": // SYS | The call parameter is based on the X or Y register 
                    // If there is an 01 in the X register then display the integer in the Y register
                    if (this.Xreg == 1) {
                
                        // Display the value in the Y register
                        _StdOut.putText(this.Yreg.toString());

                    }
                    // Print 00 teriminated string starting at address sepcified in the Y register 
                    else if (this.Xreg == 2) {
                        // Get the first location of the string to print
                        let memoryAddrToPrint = this.Yreg;

                        // Get value at the first location in memory
                        let opCodeToPrint = this.loadConstantFromMemory(memoryAddrToPrint);

                        console.log("FLAG 89 " + opCodeToPrint);

                        // Set the program counter to the new value in memory
                        this.PC = this.Yreg;

                        // Loop through Print the characters until the breakpoint is reached 
                        while (opCodeToPrint != 0) {
                            // Convert non 00 op code to the corresponding char based on ASCII
                            let charToPrint = String.fromCharCode(opCodeToPrint);
                            _StdOut.putText(charToPrint);

                            // Get the next op code
                            opCodeToPrint = this.getFollowingConstantFromMemory();
                            console.log(opCodeToPrint);
  
                        } 

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
        }

        // Helper Function to use the memory manager to access the specified memory and return the op code
        public readMemory(addr: number): string {
            return _MemoryManager.readFromMemory(addr);
        }

        // Helper function to use the memory manager to write to memory
        // not sure if in future I will have to modify the steps to writing, so abstracting it out here
        public writeToMemory(addr: number, valueToWrite: string): void {
            // Trim the white space from the value to write
            const trimmedValueToWriteString = valueToWrite.trim();

            // Parse trimmed value as an int
            const trimmedValueToWriteInt = parseInt(trimmedValueToWriteString, 16);

            // Ensure value written in HEX into memory
            const hexToWrite = TSOS.Utils.displayHex(trimmedValueToWriteInt);

            // Pass the arguments on to the memory manager
            _MemoryManager.writeToMemory(addr, hexToWrite);
        }

        // Helper function to get the following constant in memory in int form
        public getFollowingConstantFromMemory(): number {
            // Get the following address to load the constant from in memory | Increment the program counter
            const constantAddr = ++this.PC;

            // Read the constant value from memory
            const constantStringValue = this.readMemory(constantAddr);

            // Convert the constant to a number
            return parseInt(constantStringValue, 16);
        }

        // Helper function to load a constant number value from memory
        public loadConstantFromMemory(addr: number): number {
            // Load the constant value from memory
            const loadedStringValue = this.readMemory(addr);
            // Convert the loaded value to an int
            return parseInt(loadedStringValue, 16);
        }

        // Helper function to get following memory location which consists of two blocks of memory
        public getFollowingMemoryLocationFromMemory(): number {
            // Get the following memory address as a string, second half of memory address 
            const secondHalfMemAddr = this.getFollowingConstantFromMemory().toString();
    
            // Get the memory address as a string after that, front half of memory address
            const firstHalfMemAddr = this.getFollowingConstantFromMemory().toString();

            // Combine memory addresses
            const fullMemAddrString = firstHalfMemAddr + secondHalfMemAddr;

            console.log("FULL MEM ADDR " + fullMemAddrString);

            // Return them the full memory address
            return parseInt(fullMemAddrString);
        }


    }

}
