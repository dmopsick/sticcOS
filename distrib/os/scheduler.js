// Issue #42 | The CPU Scheduler Class
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        // Initialize the scheduler
        function Scheduler() {
            this.fcfsQuantum = Number.MAX_VALUE;
            this.quantum = _DefaultQuantum;
            this.readyQueue = new TSOS.Queue();
            this.cycleCounter = 0;
            // Default the scheduling algorithm to RR
            this.schedulingAlgorithm = 0;
        }
        // Issue #42 | Check the schedule on a CPU cycle and determine if a context switch is necesary
        Scheduler.prototype.checkSchedule = function () {
            console.log(this.fcfsQuantum);
            switch (this.schedulingAlgorithm) {
                case 0: // Round robin
                    this.roundRobinScheduling(this.quantum);
                    break;
                case 1: // FCSFS - Can be Round robin with high quantum (MaxInt)
                    this.roundRobinScheduling(this.fcfsQuantum);
                    break;
                case 2:
                    this.priorityScheduling();
                    break;
                default:
                    // This should not be reached
                    console.log("ERROR: Scheduling arlgorithm N/A");
                    break;
            }
            // Project 4... must check which scheduling algortihm is being used before just hopping into RR like I do right now
        };
        // Issue #48 | Abstracting out round robin functionality for use with round robin and FCFS
        Scheduler.prototype.roundRobinScheduling = function (quantum) {
            // If the cycle counter is equal to the quantum, it is time for a context switch
            if (this.cycleCounter >= quantum) {
                // The counter has reached the quantum, time to load the next process
                // Check if there are any waiting processes to switch to
                if (this.readyQueue.getSize() > 0) {
                    // Context switch from the dispatcher 
                    // _Dispatcher.contextSwitch(pcbToLoad)
                    // Throw a context switch interrupt request 
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, []));
                }
                else {
                    // Reset the cycle counter
                    this.cycleCounter = 0;
                }
                // If there are no processes ready and waiting.... keep on trucking! 
            }
            // If it is not time to make a scheduling deicison
            else {
                // Increment the cycle counter ... the current processes will execute, one cycle closer to next decision
                this.cycleCounter++;
            }
        };
        Scheduler.prototype.priorityScheduling = function () {
            console.log("Non preemptive priority scheduling");
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
