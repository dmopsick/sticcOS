// Issue #42 | The dispatcher enforces the decisions by the Scheduler
// The scheduler is the brains... the dispatcher is the muscle
module TSOS {
    export class Dispatcher {
        constructor() { }

        // Issue #42 | Handles the context switch
        // Saves the current executing process and load the new process to the CPU
        public contextSwitch(currentPID: number, pcbToLoad: ProcessControlBlock): void {
            // Save the current CPU state to the PCB for the current process

            // Load the new process to the CPU

            // Change the current executing PID global variable
        }
    }
}