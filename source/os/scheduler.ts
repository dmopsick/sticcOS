// Issue #42 | The CPU Scheduler Class
module TSOS {
    export class Scheduler {

        public quantum: number;
        public readyQueue: TSOS.Queue;
        public cycleCounter: number;

        // Initialize the scheduler
        constructor() {
            this.quantum = _DefaultQuantum;
            this.readyQueue = new TSOS.Queue();
            this.cycleCounter = 0;
        }

        // Issue #42 | Check the schedule on a CPU cycle and determine if a context switch is necesary
        public checkSchedule(): void {
            // Project 4... must check which scheduling algortihm is being used before just hopping into RR like I do right now

            // If the cycle counter is equal to the quantum, it is time for a context switch
            if (this.cycleCounter >= this.quantum) {
                // The counter has reached the quantum, time to load the next process
                console.log("SCHEDULING DECISION TIME");
                console.log(this.readyQueue);

                // Check if there are any waiting processes to switch to
                if (this.readyQueue.getSize() > 0) {
                    // Context switch from the dispatcher 
                    // _Dispatcher.contextSwitch(pcbToLoad)

                    // Throw a context switch interrupt request 
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
                }
                else {
                    console.log("NO CONTEXT SWITCH NEEDED");
                    // Reset the cycle counter
                    this.cycleCounter = 0;
                }
                // If there are no processes ready and waiting.... keep on trucking! 

            }
            // If there is nothing currently executing and there is something in the queue | Initial proccess to run
            else if (_CurrentPID == null) {
                console.log("LOAD THE PROCESS IF THERE IS NO CURRENT PID");

                // Dequeue a PCB to run
                const pcbToLoad: ProcessControlBlock = this.readyQueue.dequeue();

                // Run that PCB
                TSOS.ProcessControlBlock.loadProcessToCPU(pcbToLoad);

                // Reset cycle counter
                this.cycleCounter = 0;
            }
            // If it is not time to make a scheduling deicison
            else {
                console.log("EXECUTE THE PCB. NO CHANGE: " + this.cycleCounter);
                // Increment the cycle counter
                this.cycleCounter++;
            }
        }

    }
}