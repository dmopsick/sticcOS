// Issue #26 Creating Memory Accessor model
// The memory accessor is in charge of converting logical address to physical address
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.init = function () {
        };
        // Issue #26 Convert the logical address specified in the program code to the physical address
        MemoryAccessor.prototype.convertLogicalToPhysicalAddress = function (logicalAddress, memSegment) {
            if (memSegment === void 0) { memSegment = 0; }
            var physicalAddress = logicalAddress;
            // Use a switch case to determine if and how to modify the logical address to the correct physical address
            switch (memSegment) {
                case 0: // Working with memory segment 0 (The only one for project 2) 
                    // Do not need to modify the address
                    break;
                case 1: // Memory Segment 1
                    // Add 256 to the logical address
                    physicalAddress += 256;
                    break;
                case 2: // Memory Segment 2
                    physicalAddress += 512;
                    break;
                default: // This should not be reached
                    break;
            }
            // Return the physical address to the user
            return physicalAddress;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
