// Issue #42 | The CPU Scheduler Class
module TSOS {
    export class Scheduler {
        
        public quantum: number;
        public readyQueue: TSOS.Queue;

        constructor() { 
             this.quantum = _DefaultQuantum;
             this.readyQueue = new TSOS.Queue();
        }

    }
}