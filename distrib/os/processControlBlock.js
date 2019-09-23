// Issue #21
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, memAddrStart) {
            this.pid = pid;
            this.memAddrStart = memAddrStart;
        }
        ProcessControlBlock.prototype.init = function () {
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
