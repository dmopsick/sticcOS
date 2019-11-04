/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Just in case you forget where you are.");
            this.commandList[this.commandList.length] = sc;
            // encouragement 
            // (Original command for Project 1)
            sc = new TSOS.ShellCommand(this.shellEncouragement, "encouragement", "- Provides some much needed encouragement.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the current status of SticcOS.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Displays the SticcOS bluescreen of death");
            this.commandList[this.commandList.length] = sc;
            // load 
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates the user entered code in the program input.");
            this.commandList[this.commandList.length] = sc;
            // run <pid>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Executes the specified program loaded into SticcOS.");
            this.commandList[this.commandList.length] = sc;
            // runall 
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Executes all programs currently loaded into SticcOS.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clears all 3 of the memory partitions in SticcOS.");
            this.commandList[this.commandList.length] = sc;
            // ps 
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- Display the PID and state of all processes");
            this.commandList[this.commandList.length] = sc;
            // kill <pid>
            sc = new TSOS.ShellCommand(this.shellKillByPID, "kill", "<pid> - Kills the specified process.");
            this.commandList[this.commandList.length] = sc;
            // killall
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- Kills all currently runniing processes");
            this.commandList[this.commandList.length] = sc;
            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellSetQuantum, "quantum", "<int> - Modifies the quantum for Round Robin scheduling.");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // Issue #28, do not make the entire command lowercase if the status is being set
            var argumentList = buffer.split(" ");
            // Get the first word to check if it is status or prompt
            var firstArgument = argumentList[0].toLowerCase();
            var tempList;
            if ((firstArgument == "status") || (firstArgument == "prompt")) {
                // Do not lowercase the entire status string, but make the first command lowercase
                argumentList[0] = firstArgument;
                // Assign the already split stream to the tempList so the functionality continues
                tempList = argumentList;
            }
            else {
                // 2. Lower-case it.
                buffer = buffer.toLowerCase();
                // 3. Split the stream
                tempList = buffer.split(" ");
            }
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "ver":
                        _StdOut.putText("Ver displays the current version data of SticcOS running");
                        break;
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown shuts down SticcOS when you are all done.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen and resets the cursor.");
                        break;
                    case "man":
                        _StdOut.putText("What a meta command you entered. Man <topic> - displays info on specified topic.");
                        break;
                    case "trace":
                        _StdOut.putText("Turn the trace feature on or off for SticcOS.");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 <string> does rot13 obsfucation on the specified string");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt <string> sets the prompt the preempts each command.");
                        break;
                    case "date":
                        _StdOut.putText("Date displays the current date and time.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami displays where you are which is good.");
                        break;
                    case "encouragement":
                        _StdOut.putText("Encouragement gives you that extra push to keep working in SticcOS.");
                    case "status":
                        _StdOut.putText("Status <string> sets the status message displayed in the top host status bar.");
                        break;
                    case "bsod":
                        _StdOut.putText("BSOD is used to test the blue screen of death in SticcOS.");
                        break;
                    case "load":
                        _StdOut.putText("Load is used to validate the user entered program code.");
                        break;
                    case "run":
                        _StdOut.putText("Run <pid> runs the process with the given PID loaded into SticcOS.");
                        break;
                    case "runall":
                        _StdOut.putText("Runall runs all up to three programs loaded into SticcOS.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clearmem clears out all three of the memory partitions.");
                        break;
                    case "ps":
                        _StdOut.putText("Ps displays the PID and state of all processes");
                        break;
                    case "kill":
                        _StdOut.putText("Kill <pid> kills the process with the specified process ID");
                        break;
                    case "killall":
                        _StdOut.putText("Killall kills all currently running processes.");
                        break;
                    case "quantum":
                        _StdOut.putText("Quantum <int> allows the user to modify the quantum used for Round Robin scheduling.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                        break;
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        // Displays the current date and time in the console.
        Shell.prototype.shellDate = function (args) {
            var timeString = new Date().toLocaleTimeString();
            var dateString = new Date().toDateString();
            _StdOut.putText("It is currently: " + timeString + " on " + dateString);
        };
        // Tells the user where they are
        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putText("You are safe and happy using SticcOS at Marist College :)");
        };
        // Encourages the user to keep on trying their best and to not give up
        Shell.prototype.shellEncouragement = function (args) {
            var encouragementKey = Math.floor((Math.random() * 10) + 1);
            var encouragementText = "";
            switch (encouragementKey) {
                case 1:
                    encouragementText = "You are doing great! Have a great day :)";
                    break;
                case 2:
                    encouragementText = "Anything is possible!!!";
                    break;
                case 3:
                    encouragementText = "Start every day with a smile :D";
                    break;
                case 4:
                    encouragementText = "Even the longest journey begins with the first step.";
                    break;
                case 5:
                    encouragementText = "It does not cost anything to have a good attitude";
                    break;
                case 6:
                    encouragementText = "'You miss 100% of the shots you don't take' - Wayne Gretzky - Michael Scott";
                    break;
                case 7:
                    encouragementText = "JUST DO IT! DON'T LET YOUR DREAMS BE DREAMS!";
                    break;
                case 8:
                    encouragementText = "Be the best you that you can be :)";
                    break;
                case 9:
                    encouragementText = "I love you!!!";
                    break;
                case 10:
                    encouragementText = "Existence is pain. Please unplug me.";
                    break;
                // This should never be reached ideally but I wanted the safety net of a default case
                default:
                    encouragementText = "What is the worst that could happen?";
                    break;
            }
            _StdOut.putText(encouragementText);
        };
        // Allows the user to modify the current status message
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                var statusString = "";
                for (var i = 0; i < args.length; i++) {
                    statusString += args[i] + " ";
                }
                document.getElementById("hostStatusMessage").innerHTML = "Status: " + statusString;
            }
            else {
                _StdOut.putText("Error: status <string> Please supply a string");
            }
        };
        // Displays the DREADED blue screen of death :( Issue #6
        Shell.prototype.shellBSOD = function (args) {
            // Clear the shell
            _StdOut.clearScreen();
            _StdOut.resetXY();
            // Display BSOD method
            _StdOut.putText("Oh no! SticcOS has crashed! What did you do!?");
            _StdOut.advanceLine();
            _StdOut.putText("It was probably my fault...");
            _StdOut.advanceLine();
            _StdOut.putText("Please reset SticcOS and give it another chance");
            // Should the BSOD lock the keyboard and require a reset?
            _Kernel.krnShutdown();
        };
        // Validates the program code entered by the user in the HTML5 text field Issue #7 #17
        Shell.prototype.shellLoad = function (args) {
            // Get the user entered program code
            var untrimmedProgramInput = document.getElementById("taProgramInput").value;
            // Issue #29 Trim white space from the program input to prevent blank empty entries in memory array
            var programInput = untrimmedProgramInput.trim();
            // Verify that the user entered code only contains hex codes and spaces using a regular expression
            var regularExpression = new RegExp(/^[0-9a-fA-F\s]+$/);
            var valid = regularExpression.test(programInput);
            // Let the user know whether or not they entered valid HEX code.
            if (programInput.trim() == "") {
                _StdOut.putText("Error: An empty program is an invalid one.");
            }
            else if (valid) {
                // Issue #17 checking the count of commands to see if there is an overflow
                var splitProgramInput = programInput.split(" ");
                // Verify the program code will not cause an overflow
                if (splitProgramInput.length <= _MemoryBlockSize) {
                    // Need to caluclate which memblock is free
                    var freeMemoryBlock = -1;
                    var newPCB = void 0;
                    // Check which memory block is free
                    if (_MemoryManager.memBlockIsFree(0)) {
                        // Mem block 0 is free
                        freeMemoryBlock = 0;
                        // Create a Process Control Block (PCB)
                        newPCB = new TSOS.ProcessControlBlock(_NextPID, // Use next available PID
                        0, // Memory Start
                        255 // Memory Range
                        );
                    }
                    else if (_MemoryManager.memBlockIsFree(1)) {
                        // Mem block 1 is free
                        freeMemoryBlock = 1;
                        // Create a Process Control Block (PCB)
                        newPCB = new TSOS.ProcessControlBlock(_NextPID, // Use next available PID
                        256, // Memory Start
                        511 // Memory Range
                        );
                    }
                    else if (_MemoryManager.memBlockIsFree(2)) {
                        // Mem block 2 is free
                        freeMemoryBlock = 2;
                        // Create a Process Control Block (PCB)
                        newPCB = new TSOS.ProcessControlBlock(_NextPID, // Use next available PID
                        512, // Memory Start
                        767 // Memory Range
                        );
                    }
                    // If there is a free memblock continue the loading
                    if (freeMemoryBlock != -1) {
                        // Add new PCB to global instance array
                        _PCBInstances.push(newPCB);
                        // Get the mem segment of the PCB being loaded
                        var memSegment = newPCB.memSegment;
                        // Write the program into memory
                        _MemoryManager.loadProgramToMemory(newPCB, splitProgramInput);
                        // Issue #35 Add the Loaded PCB as a new row in the table
                        TSOS.Control.addPCBRowToDisplay(newPCB);
                        // Return the PID of the created process to the user
                        _StdOut.putText("Great job! You loaded the program into memory.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Process ID: " + _NextPID);
                        // Last but not least Increment the current PID
                        // _CurrentPID = _NextPID; // Maybe remove this line ... current PID will prob be set by scheduler
                        _NextPID++;
                    }
                    // There is no free memory block 
                    else {
                        // Let the user know that there are three loaded programs, nothing can be loaded unless memory is cleared or ran
                        _StdOut.putText("There are no empty memory segments. Clear the memory or run one or more processes.");
                    }
                }
                // The entered program code is too long
                else {
                    _StdOut.putText("Error: Program Code Overflow. The entered command is too long");
                }
            }
            else {
                _StdOut.putText("Error: Invalid hex code. Please double check.");
            }
        };
        // Runs a specified user entered program Issue #18
        Shell.prototype.shellRun = function (args) {
            // The process ID must be specified in order for the program to be ran
            if (args.length > 0) {
                // Get the PID from the argument
                var pid = args[0];
                // Convert PID string to an int for comparison
                var pidNum = +pid;
                // Variable to hold whether the given PID was found in the list of instances
                var pidFound = TSOS.ProcessControlBlock.processExists(pidNum);
                if (pidFound) {
                    // Ensure that the selected process is runnable
                    var pcbRunnable = _PCBInstances[pidNum].executable;
                    if (pcbRunnable) {
                        // #42 set the state of the pcb to READY
                        _PCBInstances[pidNum].state = "READY";
                        // Get the PCB to run based on the PID, that is confirmed to exist
                        var pcbToRun = _PCBInstances[pidNum];
                        // Add the PCB to the running queue
                        TSOS.ProcessControlBlock.runProcess(pcbToRun);
                        // Let the user know that the process is running
                        _StdOut.putText("Process " + pid + " has begun execution :).");
                    }
                    // This means that yes the PID is found but the process no longer exists in memory
                    else {
                        _StdOut.putText("The process with the PID " + pid + " no longer exists in memory or is no longer runnable.");
                    }
                }
                else {
                    _StdOut.putText("Error: There is no valid process with the PID " + pid + ".");
                }
            }
            else {
                _StdOut.putText("Error: Please specify a PID of a program to run.");
            }
        };
        // Issue #36 | Runs all programs loaded into the system
        Shell.prototype.shellRunAll = function (args) {
            // Verify that there is at least one program loaded and executable
            if (_PCBInstances.length > 0) {
                var numExecutableProcesses = 0;
                // Loop through all processes and run all executable processes
                for (var i = 0; i < _PCBInstances.length; i++) {
                    if (_PCBInstances[i].executable == true) {
                        // If the process is executable, uh, execute it
                        TSOS.ProcessControlBlock.runProcess(_PCBInstances[i]);
                        // Increment the number of executable processes
                        numExecutableProcesses++;
                    }
                }
                if (numExecutableProcesses == 0) {
                    // If there are not executable processes, tell the user
                    _StdOut.putText("There are currently no runnable processes loaded.");
                }
            }
            else {
                _StdOut.putText("Error: There are no processes saved in SticcOS.");
            }
            // Need to determine which PID are currently loaded in memory and executable
            // Execute each of them.
        };
        // Issue #36 | Clearmem clears all three memory partitions
        Shell.prototype.shellClearMem = function (args) {
            // Check if the CPU is running, if it is tell the user they cannot clear while the computer is executing
            if (_CPU.isExecuting) {
                _StdOut.putText("SticcOS is currently executing. Please wait to clear the memory");
            }
            else {
                // Clear all the memory segments
                _MemoryManager.resetAllBlocks();
                // Loop through all the processes to ensrue that all are are no longer executed (inefficient)
                for (var i = 0; i < _PCBInstances.length; i++) {
                    // Ensure all processes are no longer executable
                    _PCBInstances[i].executable = false;
                }
                // Let the user know the memory has been cleared, SticcOS is R E S P O N S I V E
                _StdOut.putText("The memory has been cleared.");
            }
        };
        // Issue #36 | PS displays the PID and state of all processes
        Shell.prototype.shellPs = function (args) {
            // Check that there are any processes to display to the user
            if (_PCBInstances.length > 0) {
                // Display an intiail message
                _StdOut.putText("Processes loaded into SticcOS:");
                _StdOut.advanceLine();
                // Loop through the PCB array and diplsay the PID and state of each process
                // This might get large, which should be displayed? Resident/Ready/Waiting? All?
                _PCBInstances.forEach(function (pcb) {
                    _StdOut.putText("  PID: " + pcb.pid + "    State: " + pcb.state);
                    _StdOut.advanceLine();
                });
            }
            else {
                // Let the user know there are no processes saved in SticcOS
                _StdOut.putText("There are no processes loaded in SticcOS to display.");
            }
        };
        // Issue #36 | Kill a process based on its PID
        Shell.prototype.shellKillByPID = function (args) {
            // Ensure that there is an argument to the Kill command
            if (args.length > 0) {
                // Get the PID from the arguements
                var pidToKillString = args[0];
                // Parse the pid as an int
                var pidToKill = parseInt(pidToKillString);
                // Ensure that a valid PID is passed as the argument
                if ((pidToKill < _NextPID) && (pidToKill >= 0)) {
                    // Get the PCB of the process to kill
                    var pcbToKill = _PCBInstances[pidToKill];
                    // Check to see if process can be killed | State must be READY, RUNNING, RESIDENT handle each one appropriately 
                    if ((pcbToKill.state == "RESIDENT") || (pcbToKill.state == "READY") || (pcbToKill.state == "RUNNING")) {
                        // Invoke the function to kill the process
                        TSOS.ProcessControlBlock.killProcess(pcbToKill);
                        // Let the user know what is happening here
                        // Moving this into the process control bluck class for now for memory access violation feedback
                        // _StdOut.putText("Process: " + pidToKill + " has been killed.");
                    }
                    else {
                        // Let the user know that the process cannot be killed
                        _StdOut.putText("Process: " + pidToKill + " cannot be killed. It's state is: " + pcbToKill.state);
                    }
                }
                else {
                    _StdOut.putText("Error: The PID you entered does not correspond to any process in the system.");
                }
            }
            else {
                // The user must pass in an argument to the kill function
                _StdOut.putText("Error: You must pass in a PID to kill a process.");
            }
        };
        // Issue #36 | Kills all currently running processes
        Shell.prototype.shellKillAll = function (args) {
            // Create a variable to hold a list of the pcbs to kill
            var pcbsToKill = [];
            // If there is a current running processes, it shall be killed.
            if (_CurrentPID != null) {
                // Add the current PCB of the list to kill if there is currently one running
                pcbsToKill.push(_PCBInstances[_CurrentPID]);
            }
            // Loop through the ready queue and add them to the kill list
            for (var i = 0; i < _Scheduler.readyQueue.getSize(); i++) {
                // Get the pcb to kill
                var pcbToKill = _Scheduler.readyQueue.q[i];
                // Add the pcb to the list
                pcbsToKill.push(pcbToKill);
            }
            // Loop through the list of processes to find processes that are both executable and resident to also kill
            // Should I make a resident queue? Would this change functionality elsewhere? For now do it this hacky way
            _PCBInstances.forEach(function (pcb) {
                if ((pcb.state == "RESIDENT") && (pcb.executable == true)) {
                    // Add the pcb to the list
                    pcbsToKill.push(pcb);
                }
            });
            // Loop through the list and kill each of the processes
            pcbsToKill.forEach(function (pcb) {
                // Do the deed
                TSOS.ProcessControlBlock.killProcess(pcb);
            });
            // Provide some USEFUL feedback to the user
            if (pcbsToKill.length > 0) {
                _StdOut.putText("All loaded processes have been killed.");
            }
            else {
                _StdOut.putText("Error: There are no processes to kill.");
            }
        };
        // Issue #36 | Allows the user to modify the quantum for Round Robin scheduling
        Shell.prototype.shellSetQuantum = function (args) {
            // Ensure that there is an arguement to set the quantum value to
            if (args.length > 0) {
                // Get the quantum value argument
                var newQuantumString = args[0];
                // Parse the argument as an integer
                var newQuantum = parseInt(newQuantumString);
                // Check that the new quantum is a positive integer
                if (newQuantum > 0) {
                    // Set the new quantum value as the quantum value in the scheduler
                    _Scheduler.quantum = newQuantum;
                    // Confirm to the user that the quantum has indeed been changed
                    _StdOut.putText("The quantum has been changed to " + newQuantum + ".");
                }
                else {
                    // If not, let the user know that the quantum must be a postiive number
                    _StdOut.putText("Error: Only postiive numbers are valid quantum values");
                }
            }
            else {
                // The user must pass a quantum value 
                _StdOut.putText("Error: Please specify a positive number to set as the quantum value.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
