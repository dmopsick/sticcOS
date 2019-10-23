// Issue #42 | The CPU Scheduler Class
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            this.quantum = _DefaultQuantum;
            this.readyQueue = new TSOS.Queue();
        }
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
