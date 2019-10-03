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
            this.resetBlocks();
        };
        // Issue #25 resets the partitions. Used to clear the memory and set it up when the OS is launched
        MemoryManager.prototype.resetBlocks = function () {
            this.partitions = [
                { memBlockID: 0, base: 0, limit: 255, isFree: true },
                { memBlockID: 1, base: 256, limit: 511, isFree: true },
                { memblockID: 2, base: 512, limit: 767, isFree: true }
            ];
            console.log(this.partitions);
        };
        // Issue #25 determine if the one (for project 2) is free or ued
        // Free = no program loaded, or a program that has been loaded and ran already
        // Project 3 will require all three to be checked so going to pass arguement for which block to check
        MemoryManager.prototype.memBlockIsFree = function (memBlockID) {
            if (memBlockID === void 0) { memBlockID = 0; }
            // See if there is a process already saved in memory
            if (this.partitions[memBlockID].isFree) {
                console.log("FLAG 2: MEMORY IS FREE!");
                return true;
            }
            else {
                console.log("FLAG 3: MEMORY IS NOT FREE!");
                return false;
            }
            // If there is no process found in the chosen block
            // Or if there is a process already ran it should overwrite?
        };
        // Issue #25 Loads program into memory
        // Takes in the PCB 
        MemoryManager.prototype.loadProgramToMemory = function (pcb, programCode) {
            // Save each Hex digit into memory
            for (var i = 0; i < programCode.length; i++) {
                _Memory.memoryArray[i] = programCode[i];
            }
            // Issue #17
            if (pcb.memAddrStart < 256) {
                this.partitions[0].isFree = false;
            }
            else if (pcb.memAddrStart < 512) {
                this.partitions[1].isFree = false;
            }
            else {
                this.partitions[2].isFree = false;
            }
            // Issue #19 Display the updated memory on the HTML OS display
            TSOS.Control.updateMemoryDisplay();
            console.log("FLAG 15: " + _Memory.memoryArray);
        };
        // Issue #25 Read code from memory 
        // Issue #18 Need to be able to read from memory to run program
        MemoryManager.prototype.readFromMemory = function (addressToRead) {
            // Return the specified memory address
            return _Memory.memoryArray[addressToRead];
        };
        // Issue #27 #17 This method writes a value to a memory address. This may be combinable with loadProgramToMemory. 
        MemoryManager.prototype.writeToMemory = function (addr, valueToWrite) {
            // If the value to write is a lone hex digit, add a zero in front so it looks consistent
            if (valueToWrite.length == 1) {
                valueToWrite = 0 + valueToWrite;
            }
            // Save the value to the specified location in memory
            _Memory.memoryArray[addr] = valueToWrite;
            console.log("FLAG 20");
            console.log(_Memory.memoryArray);
            // Update the memoery display to reflect changes
            TSOS.Control.updateMemoryDisplay();
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
