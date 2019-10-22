// Issue #24 
// Planning to make each memory block only 256 and have the accessor manage multiple memory blocks
// The memory object will be one large array containing the three blocks
// The Memory manager will handle the partitioning of the memory blocks
module TSOS {

    export class Memory {

        // Issue #45 | Assign the memory block size and count in the memory class then assign it to the globals in bootstrap
        public memoryBlockSize: number = 256;
        public memoryBlockCount: number = 3;

        constructor(public memoryArray = []) { }

        // Initializes the memory when the OS is started
        public init(): void {
            this.memoryArray = [];
            // Initialize the block with all 00s
            this.resetBlock();
        }

        // Resets the memory in the memory block to all 00s
        public resetBlock(): void {
            // Use the constant for size of the memory block to intialize the array
            for (let i = 0; i < (this.memoryBlockSize * this.memoryBlockCount); i++) {
                // Initialize the memory block with 00 in each slot
                this.memoryArray[i] = "00";
            }
        }

    }
}