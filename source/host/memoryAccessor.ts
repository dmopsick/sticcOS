// Issue #26 Creating Memory Accessor model
// The memory accessor is in charge of converting logical address to physical address
module TSOS {
    export class MemoryAccessor {

        constructor() { }

        public init(): void {

        }

        // Issue #26 Need to be able to write program code into memory
        // Parameters: memAddr, data
        public writeToMemory(memAddr, data): void { 

        }


        // Issue #26 need to be able to read program code from memory
        public readFromMemory(memAddr): void {
            
        }
    }
}