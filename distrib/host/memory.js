// Issue #24 
// Planning to make each memory block only 256 and have the accessor manage multiple memory blocks
// This will allow the system to have one program in each memory block
// The other approach would be just one memory block with 768 blocks
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memoryArray) {
            if (memoryArray === void 0) { memoryArray = []; }
            this.memoryArray = memoryArray;
        }
        // Initializes the memory when the OS is started
        Memory.prototype.init = function () {
            // Use the constant for size of the memory block to intialize the array
            for (var i = 0; i < _MemorySize; i++) {
                // Initialize the memory block with all 00
                this.memoryArray[i] == "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
