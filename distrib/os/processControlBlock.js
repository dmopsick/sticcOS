var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, memAddrStart, memRange, priority, // Issue #48 | 0 (high) - 5 (low) | Default to 4 |  Processes all have a priority value now for priority based scheduling.
        storageLocation, // MEMORY or DISK
        PC, Acc, Xreg, Yreg, ZFlag, isExecuted, // Records whether the PCB has been executed
        state, executable, // Issue #18.. For project 3 only the most recently loaded program that has not been run should be executable
        memSegment // Records which memory segment the PCB is saved in. Can be determined from memAddrStart
        ) {
            if (pid === void 0) { pid = _NextPID; }
            if (memRange === void 0) { memRange = 256; }
            if (priority === void 0) { priority = 4; }
            if (storageLocation === void 0) { storageLocation = "MEMORY"; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (ZFlag === void 0) { ZFlag = 0; }
            if (isExecuted === void 0) { isExecuted = false; }
            if (state === void 0) { state = "RESIDENT"; }
            if (executable === void 0) { executable = true; }
            if (memSegment === void 0) { memSegment = 0; }
            this.pid = pid;
            this.memAddrStart = memAddrStart;
            this.memRange = memRange;
            this.priority = priority;
            this.storageLocation = storageLocation;
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
                    this.memSegment = 0;
                    break;
                case 256:
                    this.memSegment = 1;
                    break;
                case 512:
                    this.memSegment = 2;
                    break;
            }
        }
        ProcessControlBlock.prototype.init = function () { };
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
        // Issue #18 #42 | Adds the specified processes to the ready queue and lets the CPU know to start executing
        ProcessControlBlock.runProcess = function (pcb) {
            // Prevent running the same process twice 
            if (pcb.isExecuted == false) {
                // Enqueue the processes
                _Scheduler.readyQueue.enqueue(pcb);
                // Change the state of the process from RESIDENT to READY
                pcb.state = "READY";
                // Mark the process as executed so we do not run the same processes more than once
                pcb.isExecuted = true;
                // If the CPU is not running... run it and send context switch interrupt
                if (_CPU.isExecuting == false) {
                    // Set the CPU to be executing
                    _CPU.isExecuting = true;
                    // Throw an interrupt to start the schedule
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, []));
                }
            }
        };
        // #18 Static method to handle the execution of a program
        ProcessControlBlock.loadProcessToCPU = function (pcb) {
            // Change state of PCB to running, because it is
            pcb.state = "RUNNING";
            // Set the current running process global vairable
            _CurrentPID = pcb.pid;
            // Reset the cpu before execution of new program
            _CPU.init();
            // Populate the CPU with values from the process we want to run
            _CPU.Acc = pcb.Acc;
            _CPU.PC = pcb.PC;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.ZFlag;
        };
        // Issue #36 | Kill a process | Different functionality based on different state of the process to kill
        ProcessControlBlock.killProcess = function (pcbToKill) {
            // Get the PID of the process to kill
            var pidToKill = pcbToKill.pid;
            // If the process to kill is running, throw interrupt for context switch
            if (pcbToKill.state == "RUNNING") {
                // Throw a context switch interrupt to claim a new process
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, []));
            }
            else {
                // Remove the process from the Ready queue
                for (var i = 0; i < _Scheduler.readyQueue.getSize(); i++) {
                    if (_Scheduler.readyQueue.q[i] == pidToKill) {
                        // Remove the item from the queue
                        _Scheduler.readyQueue.q.splice(i, 1);
                    }
                }
            }
            // Make the specified process no longer executable
            _PCBInstances[pidToKill].executable = false;
            // Change the state of the process to reflect its MURDER *gasp*
            _PCBInstances[pidToKill].state = "TERMINATED";
            // Remove the proccess from memory 
            _MemoryManager.freeBlockByMemBlockID(pcbToKill.memSegment);
            // I do not like putting display logic in here but I am doing it so that when the CPU signals the kill process it wil lprint
            _StdOut.putText("Process: " + pidToKill + " has been killed.");
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
