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
            // getschedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- Returns the current scheduling algorithm being used by SticcOs.");
            this.commandList[this.commandList.length] = sc;
            // set schedule [rr, fcfs, priority]
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "[rr, fcfs, priority] - sets which scheduling algorithm to use");
            this.commandList[this.commandList.length] = sc;
            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Formats the disk. Erases all saved data on disk and reinitializes it to all 00s.");
            this.commandList[this.commandList.length] = sc;
            // create <filename>
            sc = new TSOS.ShellCommand(this.shellCreateFile, "create", "<filename> - Creates a file with the given name.");
            this.commandList[this.commandList.length] = sc;
            // write <filename> "<data>"
            sc = new TSOS.ShellCommand(this.shellWriteFile, "write", '<filename> "<data>" - Writes the specified data to the specified file.');
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
                        _StdOut.putText("Load [0-4] is used to validate the user entered program code with an optional priority value of 0-4.");
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
                    case "getschedule":
                        _StdOut.putText("Getschedule returns the name of the current scheduling algorithm.");
                        break;
                    case "setschedule":
                        _StdOut.putText("Setschedule [rr, fcfs, priority] allows user to set the cpu scheduling algorithm.");
                        break;
                    case "format":
                        _StdOut.putText("Format clears and intializes the disk.");
                        break;
                    case "create":
                        _StdOut.putText("Create <filename> create a new file in the SticcOS file system.");
                        break;
                    case "write":
                        _StdOut.putText('Write <filename> "<data>" writes the specified data to the file with the provided name. The write is a destructive write not an append.');
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
                // Declare variable for default priority value 
                var priority = 4;
                // Check if there is a priority value to use and if that value is valid
                if (args.length > 0) {
                    var priorityString = args[0];
                    // The extra check is because 0 == false in evaluation So need to check that the string is parseable and 0-4
                    if ((!parseInt(priorityString) && parseInt(priorityString) != 0) || ((parseInt(priorityString) < 0) || (parseInt(priorityString) > 5))) {
                        // If the priority value cannot be parsed as a number! It is invalid
                        _StdOut.putText("Error: The priority value must be a number from 0-4.");
                        return;
                    }
                    // If the priority value is valid
                    priority = parseInt(priorityString);
                }
                // Issue #17 checking the count of commands to see if there is an overflow
                var splitProgramInput = programInput.split(" ");
                // Verify the program code will not cause an overflow
                if (splitProgramInput.length <= _MemoryBlockSize) {
                    // Need to caluclate which memblock is free
                    var freeMemoryBlock = -1;
                    var memStart = void 0, memRange = void 0;
                    if (_MemoryManager.memBlockIsFree(0)) {
                        freeMemoryBlock = 0;
                        memStart = 0;
                        memRange = 255;
                    }
                    else if (_MemoryManager.memBlockIsFree(1)) {
                        freeMemoryBlock = 1;
                        memStart = 256;
                        memRange = 511;
                    }
                    else if (_MemoryManager.memBlockIsFree(2)) {
                        freeMemoryBlock = 2;
                        memStart = 512;
                        memRange = 767;
                    }
                    // If there is a free memblock continue the loading
                    if (freeMemoryBlock != -1) {
                        var newPCB = new TSOS.ProcessControlBlock(_NextPID, memStart, memRange, priority);
                        // Add new PCB to global instance array
                        _PCBInstances.push(newPCB);
                        // Get the mem segment of the PCB being loaded
                        // const memSegment = newPCB.memSegment;
                        // Write the program into memory
                        _MemoryManager.loadProgramToMemory(newPCB, splitProgramInput);
                        // Issue #35 Add the Loaded PCB as a new row in the table
                        TSOS.Control.addPCBRowToDisplay(newPCB);
                        // Return the PID of the created process to the user
                        _StdOut.putText("Great job! You loaded the program into memory.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Process ID: " + _NextPID);
                        // Last but not least Increment the current PID
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
        // Issue # 48 | Returns the currently used scheduling algorithm
        Shell.prototype.shellGetSchedule = function (args) {
            var schedulingAlgorithm = "";
            // Get the current scheduling algorithm from the scheduler
            var currentSchedulingId = _Scheduler.schedulingAlgorithm;
            switch (currentSchedulingId) {
                case 0: // Round robin
                    schedulingAlgorithm = "Round Robin";
                    break;
                case 1: // FCFS
                    schedulingAlgorithm = "First Come, First Served";
                    break;
                case 2: // Priority
                    schedulingAlgorithm = "Non Preemptive Priority";
                    break;
                default:
                    // This should not be reached
                    schedulingAlgorithm = "Error: Scheduling algorithm N/A";
                    break;
            }
            _StdOut.putText("Current Schedule: " + schedulingAlgorithm);
        };
        // Issue #48 | Modifies the currently used scheduling algorithm
        Shell.prototype.shellSetSchedule = function (args) {
            // Check that there was an argument passed to the setSchedule function
            if (args.length > 0) {
                var inputtedSchedule = args[0];
                // Check if valid argument passed, if so modify the schedule
                switch (inputtedSchedule) {
                    case "rr":
                        // Set RR as the current scheduling algorithm
                        _Scheduler.schedulingAlgorithm = 0;
                        // Let the user know the scheduling algorithm has been changed
                        _StdOut.putText("Round Robin has been set as the CPU scheduling algorithm");
                        break;
                    case "fcfs":
                        // Set FCFS as the current scheduling algorithm
                        _Scheduler.schedulingAlgorithm = 1;
                        // Let the user know the scheduling algorithm has been changed
                        _StdOut.putText("First Come, First Served has been set as the CPU scheduling algorithm.");
                        break;
                    case "priority":
                        // Set NP Priority as the current scheduling algorithm
                        _Scheduler.schedulingAlgorithm = 2;
                        // Let the user know the scheduling algorithm has been changed
                        _StdOut.putText("Non Preemptive Priority has been set as the CPU scheduling algorithm.");
                        break;
                    default:
                        // Let user know valid input for setschedule
                        _StdOut.putText("Error: Invalid argument. Valid arguments: 'rr', 'fcfs', & 'priority'");
                        break;
                }
            }
            else {
                // Let user know they need to pass an argument
                _StdOut.putText("Error: No argument provided. Valid arguments: 'rr', 'fcfs', & 'priority'");
            }
        };
        // Issue #47 | Format the disk... Clear and reinitialize the disk
        Shell.prototype.shellFormat = function (args) {
            // Do we need to check here that nothing is running? What about formatting while process ran from disk
            // Format the disk
            _Disk.init();
            // What about programs that are loaded on disk? Do we need to change PCB
            // Let the user know that the disk was formatted
            _StdOut.putText("The disk has been formatted.");
        };
        // Issue #47 | Create a file
        // Creates a directory file block for a file with the provided name
        Shell.prototype.shellCreateFile = function (args) {
            // cannot create a file if the disk is not formatted
            if (_Disk.isFormatted) {
                // Check to see argument has been passed
                if (args.length > 0) {
                    var filename = args[0];
                    // Ensure filename is not too long. Must be Less than 60 characters
                    if (filename.length <= 60) {
                        var createResponse = _krnFileSystemDriver.createFile(filename);
                        // Based on the number returned from the create File function, return the appropriate message
                        // R E S P O N S I V E
                        switch (createResponse) {
                            case -1:
                                _StdOut.putText("Error: The file you are attempting to create already exists");
                                break;
                            case -2:
                                _StdOut.putText("Error: There are no directory blocks currently open in SticcOS.");
                                break;
                            case -3:
                                _StdOut.putText("Error: There are no data blocks currently open in SticcOS.");
                                break;
                            case 1:
                                _StdOut.putText("Successfully created a file with the name: " + filename);
                                break;
                            default:
                                _StdOut.putText("Error: Unexpected response number");
                                break;
                        }
                    }
                    else {
                        // Let the user know to shorten their filename
                        _StdOut.putText("Error: Filename too long. Must be 60 characters or less.");
                    }
                }
                else {
                    // Let user know they must pass an argument for file name
                    _StdOut.putText("Error: No argument provided. Enter a name for the file.");
                }
            }
            else {
                // Let the user know they must first format the disk
                _StdOut.putText("Error: The disk must be formatted before files can be created.");
            }
        };
        // Issue #47 | Writes the data of the specified file
        Shell.prototype.shellWriteFile = function (args) {
            // Ensure that the disk is formatted before attempting any file operations
            if (_Disk.isFormatted) {
                if (args.length >= 2) {
                    // The filename will be the first argument
                    var filename = args[0];
                    if (filename.length <= 60) {
                        // Create a string of all the arguments following the filename
                        var data = args.slice(1).join(" ");
                        // Get the first and last character of the data to ensure that the data begins and ends with quotes
                        var firstChar = data[0];
                        var lastChar = data[data.length - 1];
                        // If the first and last char are both double or single quotes, proceed
                        if ((firstChar === lastChar) && ((firstChar === "'") || (firstChar === '"'))) {
                            // Strip the data of its single or double quotes to send to the file system driver
                            var strippedData = data.substring(1, data.length - 1);
                            // Call the file system driver to write the file and return appropriate response to the user
                            var writeResponse = _krnFileSystemDriver.writeFile(filename, strippedData);
                            switch (writeResponse) {
                                case -1:
                                    _StdOut.putText("Error: No file exists with the name " + filename + " in SticcOS.");
                                    break;
                                case -2:
                                    // I do not think this case should be reached but it is here just in case
                                    _StdOut.putText("Error: There are no open data blocks for this file in SticcOS.");
                                    break;
                                case 1:
                                    _StdOut.putText("Successfully wrote to the file: " + filename);
                                    break;
                                default:
                                    _StdOut.putText("Error: Unexpected write response");
                                    break;
                            }
                        }
                        else {
                            // Let the user know how to correctly format their data
                            _StdOut.putText("Error: Invalid argument for data. Data must be contained within single or double quotes with no preceding or following characters.");
                        }
                    }
                    else {
                        // Inform user they entered an invalid filename
                        _StdOut.putText("Error: Invalid argument for filename. Filenames are 60 characters or less.");
                    }
                }
                else {
                    // If there are not enough arguments for filename and data, infrom the user of the correct usage
                    _StdOut.putText('Error: Invalid argument structure. Usage: write <filename> "data"');
                }
            }
            else {
                // Let user know they must format the disk before doing file operations
                _StdOut.putText("Error: This disk must be formatted before files can be created or written to.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
