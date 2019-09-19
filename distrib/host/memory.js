// Issue #24 
// Planning to make each memory block only 256 and have the accessor manage multiple memory blocks
// The memory object will be one large array containing the three blocks
// The Memory manager will handle the partitioning of the memory blocks
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memoryArray) {
            if (memoryArray === void 0) { memoryArray = []; }
            this.memoryArray = memoryArray;
        }
        // Initializes the memory when the OS is started
        Memory.prototype.init = function () {
            this.memoryArray = [];
            // Initialize the block with all 00s
            this.resetBlock();
        };
        // Resets the memory in the memory block to all 00s
        Memory.prototype.resetBlock = function () {
            // Use the constant for size of the memory block to intialize the array
            // for (let i = 0; i < (_MemoryBlockSize * _MemoryBlockSize); i++) {
            for (var i = 0; i < (767); i++) {
                // Initialize the memory block with all 00
                this.memoryArray[i] == "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
