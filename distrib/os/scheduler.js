// Issue #42 | The CPU Scheduler Class
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        // Initialize the scheduler
        function Scheduler() {
            this.quantum = _DefaultQuantum;
            this.readyQueue = new TSOS.Queue();
            this.cycleCounter = 1;
        }
        // Issue #42 | Check the schedule on a CPU cycle and determine if a context switch is necesary
        Scheduler.prototype.checkSchedule = function () {
            // If the cycle counter is equal to the quantum, it is time for a context switch
            if (this.cycleCounter >= this.quantum) {
                // The counter has reached the quantum, time to load the next process
                console.log("SCHEDULING DECISION TIME");
                // Check if there are any waiting processes to switch to
                // If so... 
                // Save the current CPU state to the PCB
                // Load the new
                // Context switch if needed
                // If there are no processes to switch to, keep executing the same process
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
