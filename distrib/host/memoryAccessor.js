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
            // Set the physical address to intially be the logical address
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
        // Issue #25 Read code from memory | Issue #18 Need to be able to read from memory to run program
        // Issue #45 | Only allow direct memory access in the Memory Accessor File
        // Take in Logical address, use convert function to access the physical address
        MemoryAccessor.prototype.readFromMemory = function (logicalAddress, memSegment) {
            // Convert the logical address to a physical address 
            var physicalAddress = this.convertLogicalToPhysicalAddress(logicalAddress, memSegment);
            // Return the data in the specified memory address
            return _Memory.memoryArray[physicalAddress];
        };
        // Issue #27 #17 This method writes a value to a memory address. This may be combinable with loadProgramToMemory. 
        // Issue #45 | Only the memory accessor should modify memory
        MemoryAccessor.prototype.writeToMemory = function (logicalAddress, memSegment, valueToWrite) {
            // Convert the logical address to a physical address 
            var physicalAddress = this.convertLogicalToPhysicalAddress(logicalAddress, memSegment);
            // If the value to write is a lone hex digit, add a zero in front so it looks consistent
            if (valueToWrite.length == 1) {
                valueToWrite = 0 + valueToWrite;
            }
            // Save the value to the specified location in memory
            _Memory.memoryArray[physicalAddress] = valueToWrite;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
