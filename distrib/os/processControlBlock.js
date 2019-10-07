// Issue #21
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, memAddrStart, memRange, PC, Acc, Xreg, Yreg, ZFlag, isExecuted, // Records whether the PCB has been executed
        state, executable, // Issue #18.. For project 3 only the most recently loaded program that has not been run should be executable
        memSegment // Records which memory segment the PCB is saved in. Can be determined from memAddrStart
        ) {
            if (pid === void 0) { pid = _NextPID; }
            if (memAddrStart === void 0) { memAddrStart = 0; }
            if (memRange === void 0) { memRange = 256; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (ZFlag === void 0) { ZFlag = 0; }
            if (isExecuted === void 0) { isExecuted = false; }
            if (state === void 0) { state = "Resident"; }
            if (executable === void 0) { executable = true; }
            if (memSegment === void 0) { memSegment = 0; }
            this.pid = pid;
            this.memAddrStart = memAddrStart;
            this.memRange = memRange;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.ZFlag = ZFlag;
            this.isExecuted = isExecuted;
            this.state = state;
            this.executable = executable;
            this.memSegment = memSegment;
            switch (memAddrStart) {
                case 0:
                    memSegment = 0;
                    break;
                case 256:
                    memSegment = 1;
                    break;
                case 512:
                    memSegment = 2;
                    break;
            }
        }
        ProcessControlBlock.prototype.init = function () {
        };
        // #18 A Utilitiy function used to check the PCB instance list whether an instance with the specified PID exists
        ProcessControlBlock.processExists = function (pidToCheck) {
            // Loop through instances for a process with specified PID
            for (var i = 0; i < _PCBInstances.length; i++) {
                if (pidToCheck == _PCBInstances[i].pid) {
                    return true;
                }
            }
            return false;
        };
        // #18 Static method to handle the execution of a program
        ProcessControlBlock.runProcess = function (pcb) {
            // Change state of PCB to running, because it is
            pcb.state = "Running";
            // Reset the cpu before execution of new program
            _CPU.init();
            // Populate the CPU with values from the process we want to run
            _CPU.Acc = pcb.Acc;
            _CPU.PC = pcb.PC;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.ZFlag;
            // Set the CPU to running 
            _CPU.isExecuting = true;
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
