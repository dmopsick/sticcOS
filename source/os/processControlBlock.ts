// Issue #21

module TSOS {
    export class ProcessControlBlock {
        constructor(
            public pid: number = _CurrentPID,
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

        // #18 A Utilitiy function used to check the PCB instance list whether an instance with the specified PID exists
        public static processExists(pidToCheck): boolean {
            // Loop through instances for a process with specified PID
            for (let i = 0; i < _PCBInstances.length; i++) {
                if (pidToCheck == _PCBInstances[i].pid) {
                    return true;
                }
            }
            return false;
        }
    }
}