// Issue #26 Creating Memory Accessor model

module TSOS {
    export class MemoryAccessor {
        constructor(
            public MemoryBlock1 = new Memory(),
            public MemoryBlock2 = new Memory(),
            public MemoryBlock3 = new Memory()
        ) {}

        public init(): void {
            
        }
    }
}