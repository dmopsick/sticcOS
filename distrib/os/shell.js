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
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the current status of the system.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Displays the SticcOS bluescreen of death");
            this.commandList[this.commandList.length] = sc;
            // load 
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates the user entered code in the program input.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
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
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
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
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
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
                    encouragementText = "Even the longest joureny begins with the first step.";
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
                _StdOut.putText("Usage: status <string> Please supply a string");
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
            _StdOut.putText("Either way, restart the system and give SticcOS another chance please.");
            // Should the BSOD lock the keyboard and require a reset?
        };
        // Validates the program code entered by the user in the HTML5 text field Issue #7
        Shell.prototype.shellLoad = function (args) {
            // Get the user entered program code
            var programInput = document.getElementById("taProgramInput").value;
            // Verify that the user entered code only contains hex codes and spaces using a regular expression
            var regularExpression = new RegExp(/^[0-9a-fA-F\s]+$/);
            var valid = regularExpression.test(programInput);
            console.log("FLAG 2 " + valid);
            // Let the user know whether or not they entered valid HEX code.
            if (valid) {
                _StdOut.putText("That is some highquality Hex code.");
            }
            else {
                _StdOut.putText("Error: Invalid hex code. Please double check.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
