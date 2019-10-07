// Issue #21

module TSOS {
    export class ProcessControlBlock {
        constructor(
            public pid: number = _NextPID,
            public memAddrStart: number = 0,
            public memRange: number = 256,
            public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public ZFlag: number = 0,
            public isExecuted: boolean = false, // Records whether the PCB has been executed
            public state: String = "Resident",
            public executable: boolean = true, // Issue #18.. For project 3 only the most recently loaded program that has not been run should be executable
            public memSegment: number = 0 // Records which memory segment the PCB is saved in. Can be determined from memAddrStart
        ) {
            switch (memAddrStart) {
                case 0:
                    memSegment = 0;
                    break;
                case 256:
                    memSegment = 1;
                    break;
                case 512:
                    memSegment = 2;
                    break;
            }
         }

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
            // Change state of PCB to running, because it is
            pcb.state = "Running";

            // Reset the cpu before execution of new program
            _CPU.init();

            // Populate the CPU with values from the process we want to run
            _CPU.Acc = pcb.Acc;
            _CPU.PC = pcb.PC;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.ZFlag

            // Set the CPU to running 
            _CPU.isExecuting = true;
        }
    }
}