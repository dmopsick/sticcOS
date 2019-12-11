// Issue #42 | The dispatcher enforces the decisions by the Scheduler
// The scheduler is the brains... the dispatcher is the muscle
module TSOS {
    export class Dispatcher {
        constructor() { }

        // Issue #42 | Handles the context switch
        // Saves the current executing process and load the new process to the CPU
        public contextSwitch(): void {
            // Check if priority scheduling .. if so Sort!
            if (_Scheduler.schedulingAlgorithm === 2) {
                _Scheduler.priorityScheduling();
            }

            // Get the current PCB to enqueue it
            const currentPcb: ProcessControlBlock = _PCBInstances[_CurrentPID];

            // Dequeue the next PCB to load
            const nextPcb: ProcessControlBlock = _Scheduler.readyQueue.dequeue();

            /* console.log("CONTEXT SWITCH TIME");
               console.log("WE SWITCHING FROM");
               console.log(currentPcb);
               console.log("TO");
               console.log(nextPcb); */

            // Check if there is nothing running (initial schedule)
            if (currentPcb == null) {
                // Log the loading of the processes to the kernel
                _Kernel.krnTrace("Context Switch: Loading PID " + nextPcb.pid);

                // Load the next pcb in the CPU
                TSOS.ProcessControlBlock.loadProcessToCPU(nextPcb);
            }
            // Check to see if the current process is completed or terminated, if it is we will not add it back into queue
            else if ((currentPcb.state == "COMPLETED") || (currentPcb.state == "TERMINATED")) {
                // The current process has completed, check to see if there is another process to load
                if (nextPcb == null) {
                    // Stop the CPU from executing
                    _CPU.isExecuting = false;

                    // Get rid of current ID make it null
                    _CurrentPID = null;
                }
                else {
                    // Log the context switch to the kernel log 
                    _Kernel.krnTrace("Context Switch: Switching from PID " + _CurrentPID + " to PID " + nextPcb.pid);

                    // Load the next pcb in the CPU
                    TSOS.ProcessControlBlock.loadProcessToCPU(nextPcb);
                }
            }
            // The process is not completed 
            else {
                // Change the state of the current PCB from RUNNING to READY
                _PCBInstances[_CurrentPID].state = "READY";

                // Enqueue the existing PCB
                _Scheduler.readyQueue.enqueue(currentPcb);

                // Log the context switch to the kernel log 
                _Kernel.krnTrace("Context Switch: Switching from PID " + _CurrentPID + " to PID " + nextPcb.pid);

                // Load the next pcb in the CPU
                TSOS.ProcessControlBlock.loadProcessToCPU(nextPcb);
            }

            // Reset the cycle counter
            _Scheduler.cycleCounter = 0;
        }
    }
}
