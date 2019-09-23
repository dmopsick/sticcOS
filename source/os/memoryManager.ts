// Issue #25 created Memory Manager file
// For project 2: Need to check whether there is already a program loaded
// Program gets loaded, ran, then after running can load new
// Need to add a clear shell command in project 3 but might in 2 
module TSOS {
    export class MemoryManager {
        constructor(public partitions = []) {
        }

        // Initialize the memory manager
        public init(): void {
            this.resetBlocks();
        }

        // Issue #25 resets the partitions. Used to clear the memory and set it up when the OS is launched
        public resetBlocks(): void {
            this.partitions = [ 
                {memBlockID : 0, base: 0, limit: 255, isFree: true},
                {memBlockID : 1, base: 256, limit: 511, isFree: true },
                {memblockID : 2, base: 512, limit: 767, isFree: true }
            ];
            console.log(this.partitions);
        }

        // Issue #25 determine if the one (for project 2) is free or ued
        // Free = no program loaded, or a program that has been loaded and ran already
        // Project 3 will require all three to be checked so going to pass arguement for which block to check
        public memBlockIsFree(memBlockID = 0): Boolean {
            // See if there is a process already saved in memory
            if (this.partitions[memBlockID].isFree) {
                console.log("FLAG 2");
            }

            // If there is no process found in the chosen block
            
            // Or if there is a process already ran it should overwrite?


            return true;
        }
    }
}