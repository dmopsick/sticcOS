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
            public state: String = "Resident",
            public executable: boolean = true // Issue #18.. For project 3 only the most recently loaded program that has not been run should be executable
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

        // #18 Static method to handle the execution of a program
        public static runProcess(pcb): void {
            // Need to pass the process onto the CPU and begin exectuion 
            
            // Change state of PCB to running, because it is
            pcb.state = "Running";

            
        }
    }
}