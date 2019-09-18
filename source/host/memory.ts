// Issue #24 
// Planning to make each memory block only 256 and have the accessor manage multiple memory blocks
// The memory object will be one large array containing the three blocks
// The Memory manager will handle the partitioning of the memory blocks
module TSOS {
    export class Memory {

        constructor(public memoryArray = []) { }

        // Initializes the memory when the OS is started
        public init(): void {
            // Initialize the block with all 00s
            this.resetBlock();
        }

        // Resets the memory in the memory block to all 00s
        public resetBlock(): void {
            // Use the constant for size of the memory block to intialize the array
            for (let i = 0; i < (_MemoryBlockSize * _MemoryBlockSize ); i++) {
                // Initialize the memory block with all 00
                this.memoryArray[i] == "00";
            }
        }

    }
}