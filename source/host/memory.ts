// Issue #24 
// Planning to make each memory block only 256 and have the accessor manage multiple memory blocks
// This will allow the system to have one program in each memory block
// The other approach would be just one memory block with 768 blocks
module TSOS {
    export class Memory {

        constructor(public memoryArray = []) { }

        // Initializes the memory when the OS is started
        public init(): void {
            // Use the constant for size of the memory block to intialize the array
            for (let i = 0; i < _MemorySize; i ++) {
                // Initialize the memory block with all 00
                this.memoryArray[i] == "00";
            }
        }
        
    }
}