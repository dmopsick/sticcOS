// Issue #21

module TSOS {
    export class ProcessControlBlock {
        constructor(
            public pid: number = _CurrentPID, // #21 Post increment so that when a PCB is created it increments the current PID 
            public memAddrStart: number = 0,
            public memRange: number = 256,
            public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public YReg: number = 0,
            public ZFlag: number = 0,
            public isExecuted: boolean = false, // Records whether the PCB has been executed, if it has then
            public state: String = "NEW"
        ) { }

        public init(): void {

        }
    }
}