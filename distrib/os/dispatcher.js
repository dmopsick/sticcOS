// Issue #42 | The dispatcher enforces the decisions by the Scheduler
// The scheduler is the brains... the dispatcher is the muscle
var TSOS;
(function (TSOS) {
    var Dispatcher = /** @class */ (function () {
        function Dispatcher() {
        }
        // Issue #42 | Handles the context switch
        // Saves the current executing process and load the new process to the CPU
        Dispatcher.prototype.contextSwitch = function (pcbToLoad) {
            // Change the state of the current PCB from RUNNING to READY
            _PCBInstances[_CurrentPID].state = "READY";
            // Get the current PCB to enqueue it
            var pcbToEnqueue = _PCBInstances[_CurrentPID];
            // Enqueue the existing PCB
            _Scheduler.readyQueue.enqueue(pcbToEnqueue);
            // Do I have to save the CPU to the PCB or is it already saved?
            TSOS.ProcessControlBlock.loadProcessToCPU(pcbToLoad);
        };
        return Dispatcher;
    }());
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
