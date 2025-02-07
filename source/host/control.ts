/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("taHostLog")).value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement>document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.

            // Issue #3
            (<HTMLElement>document.getElementById("hostStatusTime")).innerHTML = new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString() + " | ";
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // Set the host status bar message
            (<HTMLElement>document.getElementById("hostStatusVer")).innerHTML = APP_NAME + " ver " + APP_VERSION + " | ";
            (<HTMLElement>document.getElementById("hostStatusTime")).innerHTML = new Date().toLocaleTimeString() + " | ";
            (<HTMLElement>document.getElementById("hostStatusMessage")).innerHTML = "Status: ";

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // Enable the user program input
            (<HTMLTextAreaElement>document.getElementById("taProgramInput")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // Initialize the memory
            _Memory = new TSOS.Memory([]);
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        // Issue #27 #19 Updates the HTML cpu info display with the most up to date info
        public static updateCPUDisplay(): void {
            // Update the HTML table that displays CPU info
            (<HTMLElement>document.getElementById("cpuDisplayPC")).innerHTML = "" + TSOS.Utils.displayHex(_CPU.PC);
            (<HTMLElement>document.getElementById("cpuDisplayAcc")).innerHTML = "" + TSOS.Utils.displayHex(_CPU.Acc);
            (<HTMLElement>document.getElementById("cpuDisplayX")).innerHTML = "" + TSOS.Utils.displayHex(_CPU.Xreg);
            (<HTMLElement>document.getElementById("cpuDisplayY")).innerHTML = "" + TSOS.Utils.displayHex(_CPU.Yreg);
            (<HTMLElement>document.getElementById("cpuDisplayZ")).innerHTML = "" + TSOS.Utils.displayHex(_CPU.Zflag);
        }

        // Issue #45 #25 | Add new PCB row to the PCB display
        public static addPCBRowToDisplay(pcb: ProcessControlBlock): void {
            // Add a new row element to the Table element #processDisplayTableBody
            (<HTMLElement>document.getElementById("processDisplayTableBody")).innerHTML += "<tr id='processRow-" + pcb.pid + "'>" +
                "<td id='processDisplayPID-" + pcb.pid + "'></td>" +
                "<td id='processDisplayState-" + pcb.pid + "'></td>" +
                "<td id='processDisplayPC-" + pcb.pid + "'></td>" +
                "<td id='processDisplayAcc-" + pcb.pid + "'> </td>" +
                "<td id='processDisplayX-" + pcb.pid + "'> </td>" +
                "<td id='processDisplayY-" + pcb.pid + "'> </td>" +
                "<td id='processDisplayZ-" + pcb.pid + "'> </td>" +
                "<td id ='processDisplayStorageLocation-" + pcb.pid + "'> </td>" +
                "</tr>";
        }

        // Issue #27 #21 Update the HTML PCB display with the most recent PCB info
        public static updatePCBDisplay(): void {
            // Update the HTML table that displays PCB info
            // #45 #35 update the display of all executable processes
            _PCBInstances.forEach(pcb => {
                (<HTMLElement>document.getElementById("processDisplayPID-" + pcb.pid)).innerHTML = "" + TSOS.Utils.displayHex(pcb.pid);
                (<HTMLElement>document.getElementById("processDisplayState-" + pcb.pid)).innerHTML = "" + pcb.state;
                (<HTMLElement>document.getElementById("processDisplayPC-" + pcb.pid)).innerHTML = "" + TSOS.Utils.displayHex(pcb.PC);
                (<HTMLElement>document.getElementById("processDisplayAcc-" + pcb.pid)).innerHTML = "" + TSOS.Utils.displayHex(pcb.Acc);
                (<HTMLElement>document.getElementById("processDisplayX-" + pcb.pid)).innerHTML = "" + TSOS.Utils.displayHex(pcb.Xreg);
                (<HTMLElement>document.getElementById("processDisplayY-" + pcb.pid)).innerHTML = "" + TSOS.Utils.displayHex(pcb.Yreg);
                (<HTMLElement>document.getElementById("processDisplayZ-" + pcb.pid)).innerHTML = "" + TSOS.Utils.displayHex(pcb.ZFlag);
                (<HTMLElement>document.getElementById("processDisplayStorageLocation-" + pcb.pid)).innerHTML = pcb.storageLocation;
            });
        }

        // Issue #36 Remove any process(es) from the PCB display on the HTML display | Used in Kill all, clearmem
        // Will need a modified version of this for kill I suppose!
        public static clearAllPCBDisplay(): void {
            // Issue #36 Will need to remove some dynamically created processes displayed.
            // Will be dependent on the above rework...

        }

        // Issue #27 #19 Update the HTML Memory display with the most recent memory info
        public static updateMemoryDisplay(): void {
            // Update the HTML table that displays Memory info
            // For project 2 only record information for 1 memory segment. For project 3 will have three segments

            // Initialize a string containing the HTML of the memory table
            let memoryTableHTML = "";

            // Will need to change this logic to make it dynamic for project 3
            // Will need to change the starting point and bound

            // Want to make rows of 8. So will use modulus to make new rows.
            for (let i = 0; i < (_MemoryBlockSize * _MemoryBlockCount); i++) {
                let hex = i.toString(16);

                // Add 0's to the front of the hex number if need be to make it three significant digits
                if (hex.length == 1) {
                    hex = "00" + hex;
                }
                else if (hex.length == 2) {
                    hex = "0" + hex;
                }

                if (i == 0) {
                    memoryTableHTML += "<tr>";
                }
                if (i % 8 == 0) {
                    memoryTableHTML += "</tr><tr><th>0x" + hex + "</th>";
                }
                memoryTableHTML += "<th id='mem-block-" + i + "'> " + TSOS.Utils.displayHex(_Memory.memoryArray[i]) + " </th>";
            }
            (<HTMLElement>document.getElementById("memoryInfoTableBody")).innerHTML = memoryTableHTML;
        }

        // Issue #49 Initialize the disk display
        // Inspired by TienOS way of displaying TSB | In Use | Next | Data
        public static initDiskDisplay(): void {
            // Variable to hold the table body generated from the following triple nested loop
            let diskTableBodyHTML = "";

            // Create each row in the table for each block and populate with starting values BEFORE FORMAT
            for (let i = 0; i < _Disk.tracks; i++) {
                for (let j = 0; j < _Disk.sections; j++) {
                    for (let k = 0; k < _Disk.sections; k++) {
                        // Variable to keep track of data for each row
                        let data = "";

                        // Compile the TSB from the index of each of the loops
                        const tsb = new TSB(i, j, k);

                        // Generate a unique ID for each row of the table
                        const rowId = "tsb-" + tsb.getRawTSB();

                        // Set all the block to 0
                        for (let m = 0; m < _Disk.blockSize; m++) {
                            data += "0";
                        }


                        diskTableBodyHTML += "<tr id='" + rowId + "'>";
                        diskTableBodyHTML += "<td>" + tsb.getTSBKey() + "</td>";
                        diskTableBodyHTML += "<td>" + data[0] + "</td>";
                        diskTableBodyHTML += "<td>" + data[1] + data[2] + data[3] + "</td>";
                        diskTableBodyHTML += "<td>" + data.substring(4, _Disk.blockSize) + "</td>";
                        diskTableBodyHTML += "</tr>";
                    }
                }
            }
            // Update the HTML tablebody with the generated table
            (<HTMLElement>document.getElementById("diskInfoTableBody")).innerHTML = diskTableBodyHTML;
        }

        // Issue #49 | Update specific key/value pair in HTML disk display
        public static updateDiskDisplay(tsb: TSB, data: string): void {
            // Update the specific row with key of TSB and value of data
            // Initialize variable with TSB
            let rowHTML = "<td>" + tsb.getTSBKey() + "</td>";
            // In Use
            rowHTML += "<td>" + data.substring(1, 2) + "</td>";
            // Next
            rowHTML += "<td>" + data.substring(3, 4) + ":" + data.substring(5, 6) + ":" + data.substring(7, 8) + "</td>";
            // Data
            rowHTML += "<td>" + data.substring(8) + "</td>"

            const rowId = "tsb-" + tsb.getRawTSB();
            (<HTMLElement>document.getElementById(rowId)).innerHTML = rowHTML;
        }
    }
}
