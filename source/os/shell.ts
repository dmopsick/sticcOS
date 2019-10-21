/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                "ver",
                "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                "help",
                "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                "shutdown",
                "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                "cls",
                "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                "man",
                "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                "trace",
                "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                "rot13",
                "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                "prompt",
                "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                "whereami",
                "- Just in case you forget where you are.");
            this.commandList[this.commandList.length] = sc;

            // encouragement 
            // (Original command for Project 1)
            sc = new ShellCommand(this.shellEncouragement,
                "encouragement",
                "- Provides some much needed encouragement.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                "status",
                "<string> - Sets the current status of SticcOS.");
            this.commandList[this.commandList.length] = sc;

            // bsod
            sc = new ShellCommand(this.shellBSOD,
                "bsod",
                "- Displays the SticcOS bluescreen of death");
            this.commandList[this.commandList.length] = sc;

            // load 
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Validates the user entered code in the program input.");
            this.commandList[this.commandList.length] = sc;

            // run <pid>
            sc = new ShellCommand(this.shellRun,
                "run",
                "<pid> - Executes the specified program loaded into SticcOS.");
            this.commandList[this.commandList.length] = sc;

            // runall 
            sc = new ShellCommand(this.shellRunAll,
                "runAll",
                "- Executes all programs currently loaded into SticcOS.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Clears all 3 of the memory partitions in SticcOS.");
            this.commandList[this.commandList.length] = sc;

            // ps 
            sc = new ShellCommand(this.shellPs,
                "ps",
                "- Display the PID and state of all processes");
            this.commandList[this.commandList.length] = sc;

            // kill <pid>
            sc = new ShellCommand(this.shellKillByPID,
                "kill",
                "<pid> - Kills the specified process.");
            this.commandList[this.commandList.length] = sc; 
            
            // killall
            sc = new ShellCommand(this.shellKillAll,
                "killall",
                "- Kills all currently runniing processes"
            );
            this.commandList[this.commandList.length] = sc;

            // quantum <int>
            sc = new ShellCommand(this.shellSetQuantum,
                "quantum",
                "<int> - Modifies the quantum for Round Robin scheduling.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // Issue #28, do not make the entire command lowercase if the status is being set
            const argumentList = buffer.split(" ");
            // Get the first word to check if it is status or prompt
            const firstArgument = argumentList[0].toLowerCase();

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
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
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
                        _StdOut.putText("What a meta command you entered. Man <topic> - displays info on specified topic.")
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
                        _StdOut.putText("Status <string> sets the status message displayed in the top host status bar.")
                        break;
                    case "bsod":
                        _StdOut.putText("BSOD is used to test the blue screen of death in SticcOS.")
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
                        _StdOut.putText("Killall kills all currently running processes.")
                        break;
                    case "quantum":
                        _StdOut.putText("Quantum <int> allows the user to modify the quantum used for Round Robin scheduling.")
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                        break;
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        // Displays the current date and time in the console.
        public shellDate(args: string[]) {
            const timeString = new Date().toLocaleTimeString();
            const dateString = new Date().toDateString();
            _StdOut.putText("It is currently: " + timeString + " on " + dateString);
        }

        // Tells the user where they are
        public shellWhereAmI(args: string[]) {
            _StdOut.putText("You are safe and happy using SticcOS at Marist College :)");
        }

        // Encourages the user to keep on trying their best and to not give up
        public shellEncouragement(args: string[]) {
            const encouragementKey = Math.floor((Math.random() * 10) + 1);
            let encouragementText = "";
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
                    encouragementText = "Existince is pain. Please unplug me.";
                    break;
                // This should never be reached ideally but I wanted the safety net of a default case
                default:
                    encouragementText = "What is the worst that could happen?";
                    break;
            }
            _StdOut.putText(encouragementText);
        }

        // Allows the user to modify the current status message
        public shellStatus(args: string[]) {
            if (args.length > 0) {
                let statusString = "";
                for (let i = 0; i < args.length; i++) {
                    statusString += args[i] + " "
                }
                (<HTMLElement>document.getElementById("hostStatusMessage")).innerHTML = "Status: " + statusString;
            }
            else {
                _StdOut.putText("Usage: status <string> Please supply a string");
            }
        }

        // Displays the DREADED blue screen of death :( Issue #6
        public shellBSOD(args: string[]) {
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
        }

        // Validates the program code entered by the user in the HTML5 text field Issue #7 #17
        public shellLoad(args: string[]) {
            // Get the user entered program code
            const untrimmedProgramInput = (<HTMLTextAreaElement>document.getElementById("taProgramInput")).value;

            // Issue #29 Trim white space from the program input to prevent blank empty entries in memory array
            const programInput = untrimmedProgramInput.trim();

            // Verify that the user entered code only contains hex codes and spaces using a regular expression
            let regularExpression = new RegExp(/^[0-9a-fA-F\s]+$/);
            let valid = regularExpression.test(programInput);

            // Let the user know whether or not they entered valid HEX code.
            if (programInput.trim() == "") {
                _StdOut.putText("Error: An empty program is an invalid one.");
            }
            else if (valid) {
                // Issue #17 checking the count of commands to see if there is an overflow
                const splitProgramInput = programInput.split(" ");

                // Verify the program code will not cause an overflow
                if (splitProgramInput.length <= _MemoryBlockSize) {
                    // Check to see the memory block is full (Project 2, will check only 1 by defauly)
                    const freeMemoryBlock = _MemoryManager.memBlockIsFree();

                    // If the lone memory block is currently full... Erase the current code in memory to prepare for new code
                    if (!freeMemoryBlock) {
                        _MemoryManager.resetBlocks();

                        // Have to make the previous process unrunnable by the run command
                        // The previous program(s) cannot be ran because they are being removed from memory
                    }
                    // Continue saving the program now

                    // Create a Process Control Block (PCB)
                    const newPCB = new TSOS.ProcessControlBlock(
                        _NextPID, // Use next available PID
                        0, // Memory Start
                        256 // Memory Range
                    );

                    // Add new PCB to global instance array
                    _PCBInstances.push(newPCB);

                    // Write the program into memory
                    _MemoryManager.loadProgramToMemory(newPCB, splitProgramInput);

                    // Issue #35 Add the Loaded PCB as a new row in the table
                    TSOS.Control.addPCBRowToDisplay(newPCB);


                    // If this is not the first program in memory, make the most recent program unexecutable
                    // This is only for project 2 where one program is being loaded at a time
                    if (_NextPID > 0) {
                        _PCBInstances[_CurrentPID].executable = false;
                    }

                    // Return the PID of the created process to the user
                    _StdOut.putText("Great job! You loaded the program into memory.");
                    _StdOut.advanceLine();
                    _StdOut.putText("Process ID: " + _NextPID);

                    // Last but not least Increment the current PID
                    _CurrentPID = _NextPID;
                    _NextPID++;

                }
                // The entered program code is too long
                else {
                    _StdOut.putText("Error: Program Code Overflow. The entered command is too long");
                }
            }
            else {
                _StdOut.putText("Error: Invalid hex code. Please double check.");
            }
        }

        // Runs a specified user entered program Issue #18
        public shellRun(args: string[]) {
            // The process ID must be specified in order for the program to be ran
            if (args.length > 0) {
                // Get the PID from the argument
                const pid = args[0];

                // Convert PID string to an int for comparison
                const pidNum = +pid;

                // Variable to hold whether the given PID was found in the list of instances
                let pidFound = TSOS.ProcessControlBlock.processExists(pidNum);

                if (pidFound) {

                    // Ensure that the selected process is runnable
                    const pcbRunnable = _PCBInstances[pidNum].executable;
                    if (pcbRunnable) {
                        // Get the PCB to run based on the PID, that is confirmed to exist
                        const pcbToRun = _PCBInstances[pidNum];

                        // Begin the running of the process
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
                    _StdOut.putText("Error: There is no valid process with the PID " + pid);
                }
            }
            else {
                _StdOut.putText("Error: Please specify a PID of a program to run.");
            }
        }

        // Issue #36 | Runs all programs loaded into the system
        public shellRunAll(args: string[]) {
            // Verify that there is at least one program loaded and executable

            // Need to determine which PID are currently loaded in memory and executable

            // Execute each of them.
        }

        // Issue #36 | Clearmem clears all three memory partitions
        public shellClearMem(args: string[]) {
            // Reset the three memory partitions
            _MemoryManager.resetBlocks();
            
            // Need to make the currently loaded processes no longer runnable because they have gotten the AXE
            // Not sure if this is the best way right now... But it will certainly make all loaded PCBs unexecutable
            for(let i = 0; i < _PCBInstances.length; i ++) {
                // Ensure all processes are no longer executable
                _PCBInstances[i].executable = false;
            }


            // Let the user know the memory has been cleared, SticcOS is R E S P O N S I V E
            _StdOut.putText("The memory has been cleared.");
        }

        // Issue #36 | PS displays the PID and state of all processes
        public shellPs(args: string[]) {
            
        }

        // Issue #36 | Kill a process based on its PID
        public shellKillByPID(args: string[]) {
            // Ensure that there is an argument to the Kill command
            if (args.length > 0) {
                // Must ensure that the argument is a number

                // If argument is a number must ensure that it is a valid PID in the system
            }
            else {
                // The user must pass in an argument to the kill function
                _StdOut.putText("You must pass in a PID to kill a process.");
            }
        }

        // Issue #36 | Kills all currently running processes
        public shellKillAll(args: string[]) {
            // Find out which processes are running

            // Kill each of the running processes
        }

        // Issue #36 | Allows the user to modify the quantum for Round Robin scheduling
        public shellSetQuantum(args: string[]) {
            // Ensure that there is an arguement to set the quantum value to
            if (args.length > 0) {
                // Check that the user passed a valid int as an argument

                // If not, tell them the correct way to use this function 
            }
            else {
                // The user must pass a quantum value 
                _StdOut.putText("Please specify an integer to set as the quantum value.")
            }

        }
    }
}
