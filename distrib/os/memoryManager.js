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
            _Memory.resetAllBlocks();
            // Reset partitions table
            this.partitions = [
                { memBlockID: 0, base: 0, limit: 255, isFree: true },
                { memBlockID: 1, base: 256, limit: 511, isFree: true },
                { memblockID: 2, base: 512, limit: 767, isFree: true }
            ];
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
            // If there is no process found in the chosen block
            // Or if there is a process already ran it should overwrite?
        };
        // Issue #25 Loads program into memory
        // Takes in the PCB 
        MemoryManager.prototype.loadProgramToMemory = function (pcb, programCode) {
            console.log("MEM SEGMENT to load: " + pcb.memSegment);
            // Save each Hex digit into memory
            for (var i = 0; i < programCode.length; i++) {
                // _Memory.memoryArray[i] = programCode[i];
                _MemoryAccessor.writeToMemory(i, pcb.memSegment, programCode[i]);
            }
            // Issue #17 | make the 
            if (pcb.memSegment == 0) {
                console.log("Mem segment 0 is now not free");
                this.partitions[0].isFree = false;
            }
            else if (pcb.memSegment == 1) {
                console.log("Mem segment 1 is now not free");
                this.partitions[1].isFree = false;
            }
            else {
                console.log("Mem segment 2 is now not free");
                this.partitions[2].isFree = false;
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
