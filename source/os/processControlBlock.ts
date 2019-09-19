// Issue #21

module TSOS {
    export class ProcessControlBlock {
        constructor(public pid: number, public memAddrStart: number) { }

        public init(): void {

        }
    }
}