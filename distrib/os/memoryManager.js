// Issue #25 created Memory Manager file
// For project 2: Need to check whether there is already a program loaded
// Program gets loaded, ran, then after running can load new
// Need to add a clear shell command in project 3 but might in 2 
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(partitions) {
            if (partitions === void 0) { partitions = []; }
            this.partitions = partitions;
        }
        // Initialize the memory manager
        MemoryManager.prototype.init = function () {
            this.resetAllBlocks();
        };
        // Issue #25 resets the partitions. Used to clear the memory and set it up when the OS is launched
        MemoryManager.prototype.resetAllBlocks = function () {
            // Reset the values in memory to all zeros
            _MemoryAccessor.resetAllBlocks();
            // Initialize partitions table
            this.partitions = [
                { memBlockID: 0, base: 0, limit: 255, isFree: true },
                { memBlockID: 1, base: 256, limit: 511, isFree: true },
                { memBlockID: 2, base: 512, limit: 767, isFree: true }
            ];
        };
        // Resets just a single block
        MemoryManager.prototype.resetSingleBlock = function (memBlockID) {
            // Call the memory accessor to reset the block
            _MemoryAccessor.resetSingleBlock(memBlockID);
            // Make the partition free so new programs can be loaded
            this.partitions[memBlockID].isFree = true;
        };
        // Issue #36 | Frees a block in memory. Used to make a block free without resetting it for kill command
        MemoryManager.prototype.freeBlockByMemBlockID = function (memBlockID) {
            // Make the specified partition free so new processes can be loaded
            this.partitions[memBlockID].isFree = true;
        };
        // Issue #25 determine if the one (for project 2) is free or ued
        // Free = no program loaded, or a program that has been loaded and ran already
        // Project 3 will require all three to be checked so going to pass arguement for which block to check
        MemoryManager.prototype.memBlockIsFree = function (memBlockID) {
            // See if there is a process already saved in memory
            if (this.partitions[memBlockID].isFree) {
                return true;
            }
            else {
                return false;
            }
        };
        // Issue #25 Loads program into memory
        // Takes in the PCB and loads it to memory
        MemoryManager.prototype.loadProgramToMemory = function (pcb, programCode) {
            // First reset the block to save to
            _MemoryAccessor.resetSingleBlock(pcb.memSegment);
            // Save each Hex digit into memory
            for (var i = 0; i < programCode.length; i++) {
                _MemoryAccessor.writeToMemory(i, pcb.memSegment, programCode[i]);
            }
            // Issue #17 | Change the partition isFree value to false because it is no longer free
            if (pcb.memSegment == 0) {
                this.partitions[0].isFree = false;
            }
            else if (pcb.memSegment == 1) {
                this.partitions[1].isFree = false;
            }
            else {
                this.partitions[2].isFree = false;
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
