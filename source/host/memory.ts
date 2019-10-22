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
            this.resetAllBlocks();
        }

        // Resets the memory in the memory block to all 00s
        public resetAllBlocks(): void {
            // Use the constant for size of the memory block to set the entire array to 00
            for (let i = 0; i < (this.memoryBlockSize * this.memoryBlockCount); i++) {
                // Initialize the memory block with 00 in each slot
                this.memoryArray[i] = "00";
            }
        }

        // Reset one specific block in memory 
        public resetBlock(memSegment: number): void {
            // Calculate the beginning of the segment to reset
            const segmentStart = memSegment * this.memoryBlockSize;

            // Calculate the end of the segment to reset 
            const segmentEnd = memSegment * this.memoryBlockSize + this.memoryBlockSize;

            // Reset the chosen segment with zeros
            for(let i = segmentStart; i < segmentEnd; i++) {
                this.memoryArray[i] = "00";
            }
        }

    }
}