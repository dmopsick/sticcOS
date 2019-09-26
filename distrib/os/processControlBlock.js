// Issue #21
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, // #21 Post increment so that when a PCB is created it increments the current PID 
        memAddrStart, memRange, PC, Acc, Xreg, YReg, ZFlag, isExecuted, // Records whether the PCB has been executed, if it has then
        state) {
            if (pid === void 0) { pid = _CurrentPID; }
            if (memAddrStart === void 0) { memAddrStart = 0; }
            if (memRange === void 0) { memRange = 256; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (YReg === void 0) { YReg = 0; }
            if (ZFlag === void 0) { ZFlag = 0; }
            if (isExecuted === void 0) { isExecuted = false; }
            if (state === void 0) { state = "NEW"; }
            this.pid = pid;
            this.memAddrStart = memAddrStart;
            this.memRange = memRange;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
            this.isExecuted = isExecuted;
            this.state = state;
        }
        ProcessControlBlock.prototype.init = function () {
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
