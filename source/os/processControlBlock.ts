// Issue #21

module TSOS {
    export class ProcessControlBlock {
        constructor(
            public pid: number = _NextPID,
            public memAddrStart: number,
            public memRange: number = 256,
            public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public ZFlag: number = 0,
            public isExecuted: boolean = false, // Records whether the PCB has been executed
            public state: String = "RESIDENT",
            public executable: boolean = true, // Issue #18.. For project 3 only the most recently loaded program that has not been run should be executable
            public memSegment: number = 0 // Records which memory segment the PCB is saved in. Can be determined from memAddrStart
        ) {
            switch (memAddrStart) {
                case 0:
                    this.memSegment = 0;
                    console.log("PCB " + pid + " is in memory segment 0");
                    break;
                case 256:
                    this.memSegment = 1;
                    console.log("PCB " + pid + " is in memory segment 1");
                    break;
                case 512:
                    this.memSegment = 2;
                    console.log("PCB " + pid + " is in memory segment 2");
                    break;
            }
        }

        public init(): void {

        }

        // #18 A Utilitiy function used to check the PCB instance list whether an instance with the specified PID exists
        public static processExists(pidToCheck: number): boolean {
            // Loop through instances for a process with specified PID
            for (let i = 0; i < _PCBInstances.length; i++) {
                if (pidToCheck == _PCBInstances[i].pid) {
                    return true;
                }
            }
            return false;
        }

        // Issue #18 #42 | Adds the specified processes to the ready queue and lets the CPU know to start executing
        public static runProcess(pcb: ProcessControlBlock): void {
            // Prevent running the same process twice 
            if (pcb.isExecuted == false) {
                // Enqueue the processes
                _Scheduler.readyQueue.enqueue(pcb);

                // Change the state of the process from RESIDENT to READY
                pcb.state = "READY";

                // Mark the process as executed so we do not run the same processes more than once
                pcb.isExecuted = true;

                // If the CPU is not running... run it and send context switch interrupt
                if (_CPU.isExecuting == false) {
                    // Set the CPU to be executing
                    _CPU.isExecuting = true;

                    // Throw an interrupt to start the schedule
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
                }
            }
        }

        // #18 Static method to handle the execution of a program
        public static loadProcessToCPU(pcb: ProcessControlBlock): void {
            // Change state of PCB to running, because it is
            pcb.state = "RUNNING";

            // Set the current running process global vairable
            _CurrentPID = pcb.pid;

            // Reset the cpu before execution of new program
            _CPU.init();

            // Populate the CPU with values from the process we want to run
            _CPU.Acc = pcb.Acc;
            _CPU.PC = pcb.PC;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.ZFlag
        }

        // Issue #36 | Kill a process | Different functionality based on different state of the process to kill
        public static killProcess(pcbToKill: ProcessControlBlock): void {
            // Get the PID of the process to kill
            const pidToKill = pcbToKill.pid;

            // If the process to kill is running, throw interrupt for context switch
            if (pcbToKill.state == "RUNNING") {
                // Throw a context switch interrupt to claim a new process
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
            }
            else {
                // Remove the process from the Ready queue
                for(let i = 0; i < _Scheduler.readyQueue.getSize(); i++) {
                    if (_Scheduler.readyQueue.q[i] == pidToKill) {
                        // Remove the item from the queue
                        _Scheduler.readyQueue.q.splice(i, 1);
                    }

                }
            }

            // Make the specified process no longer executable
            _PCBInstances[pidToKill].executable = false;

            // Change the state of the process to reflect its MURDER *gasp*
            _PCBInstances[pidToKill].state = "TERMINATED";

            // Remove the proccess from memory 
            _MemoryManager.resetSingleBlock(pcbToKill.memSegment);
        }
    }
}