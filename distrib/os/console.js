/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, previousLineXPosition, // Issue #8 keeps track of where the previous line x positon was before wrapping, used to backspace
        buffer, bufferHistory, // Issue #5 records the history of the commands issued
        currentBufferIndex) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (previousLineXPosition === void 0) { previousLineXPosition = 0; }
            if (buffer === void 0) { buffer = ""; }
            if (bufferHistory === void 0) { bufferHistory = []; }
            if (currentBufferIndex === void 0) { currentBufferIndex = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.previousLineXPosition = previousLineXPosition;
            this.buffer = buffer;
            this.bufferHistory = bufferHistory;
            this.currentBufferIndex = currentBufferIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // Issue #5 do not want to save empty commands in the buffer
                    if (this.bufferHistory[this.bufferHistory.length - 1] == "") {
                        // Save the executed command
                        this.bufferHistory[this.bufferHistory.length - 1] = this.buffer;
                    }
                    else {
                        // Save the executed command
                        this.bufferHistory[this.bufferHistory.length] = this.buffer;
                    }
                    // Reset the current buffer history index
                    this.currentBufferIndex = this.bufferHistory.length;
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(9)) {
                    // Issue #5 tab command completion
                    this.handleTabAutoComplete();
                }
                else if (chr === String.fromCharCode(8)) {
                    // Issue #5 handle backspacing
                    this.handleBackspace();
                }
                else if (chr === String.fromCharCode(38)) {
                    // Issue #5 handle the up arrow for command recalling
                    this.handleUpArrow();
                }
                else if (chr === String.fromCharCode(40)) {
                    // Issue #5 handle the down arrow for command recalling
                    this.handleDownArrow();
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        };
        Console.prototype.putText = function (text) {
            console.log(text);
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates one character at a time
                for (var i = 0; i < text.length; i++) {
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[i]);
                    // Calculate distance to move current X position
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[i]);
                    // console.log("FLAG x width: " + this.currentXPosition);
                    // Issue #8 Check if the command is too long and going off the screen
                    if (this.currentXPosition > (_Canvas.width - 20)) {
                        this.previousLineXPosition = this.currentXPosition + offset;
                        this.advanceLine();
                    }
                    // The cursor does not need to be moved down a level
                    else {
                        this.currentXPosition = this.currentXPosition + offset;
                    }
                }
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            // Moved this existing code into a variable so I could use it below for scrolling purposes.
            var lineIncrement = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // This is the default code, just saved as a variable.
            this.currentYPosition += lineIncrement;
            // Check if the next line goes off the screen
            if (this.currentYPosition >= _Canvas.height) {
                // Take a snapshot of the current canvas minus the top line, starting at postion (0, lineincrement)
                var snapshot = _DrawingContext.getImageData(0, lineIncrement, _Canvas.width, (_Canvas.height - lineIncrement));
                // Clear screen
                this.clearScreen();
                // Reprint canvas with adjusted canvas from the top.
                _DrawingContext.putImageData(snapshot, 0, 0);
                // Have to set current y positon to bottom of the screen
                // Setting the y position to be one line's increment away from the bottom
                // The plus 10 is to prevent commands from bunching up
                this.currentYPosition = (_Canvas.height - lineIncrement) + 10;
            }
        };
        // Issue #8 move the cursor back up
        Console.prototype.moveLineUp = function () {
            // Calculate how much to move the cursor up
            var lineIncrement = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // This is the default code, just saved as a variable.
            this.currentYPosition -= lineIncrement;
            // Set the X position to the end of the line
            // The previousLineXPosition keeps track of where the last character ends on wrap line down.
            // Keeps the visual backspace on the canvas consistent with the buffer
            this.currentXPosition = (this.previousLineXPosition);
        };
        // Issue #5 Handles the autocompletion of commands with the tab key
        // Doing it in this file rather than shell.js so I can edit the buffer
        Console.prototype.handleTabAutoComplete = function () {
            var _this = this;
            // Create array to all string of all potential commands
            var commandList = [];
            // Populate the array of potential commands with command list from the shell
            _OsShell.commandList.forEach(function (command) {
                commandList.push(command.command);
            });
            // Create an array to hold potential command matches to the buffer
            var potentialMatches = [];
            // Loop through all potenial commands and check for potential matches
            // Will I get an array out of bounds error if I press tab on a very long string though?
            commandList.forEach(function (command) {
                // Command can only be a potential autocomplete match if the command is longer than the buffer
                if (command.length > _this.buffer.length) {
                    // Get substring the length of the buffer of the command
                    var commandSubString = command.substring(0, _this.buffer.length);
                    // Compare substring to the buffer, if they are the same then it is a potential match
                    if (commandSubString === _this.buffer) {
                        potentialMatches.push(command);
                    }
                    // If not, do not need to do anything
                }
                // If the command in the buffer is longer then, or equal to the command, it is not a potential match
                // We do not need to do anything with it
            });
            // If there is one match, autocomplete
            if (potentialMatches.length == 1) {
                var missingCommandHalf = potentialMatches[0].substring(this.buffer.length);
                this.putText(missingCommandHalf);
                // Set the buffer to have the value of the autocompleted command
                this.buffer = potentialMatches[0];
            }
            // If there are more than one match, display the matches
            else if (potentialMatches.length > 1) {
                // Go to the next line to show potential options
                this.advanceLine();
                // Display the commands
                potentialMatches.forEach(function (match) {
                    _this.putText(match + " ");
                });
                this.advanceLine();
                // Clear buffer to make sure suggestions are not in the buffer
                this.buffer = "";
                _OsShell.putPrompt();
            }
            // If no matches, nothing needs to be done
        };
        // Issue #5 handles the backspace action
        Console.prototype.handleBackspace = function () {
            // Get the last character in the string
            var charToDelete = this.buffer.substring(this.buffer.length - 1);
            // Remove the last character from the buffer string
            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
            // Get the width of the last character in the string
            var deleteWidth = TSOS.CanvasTextFunctions.measure(this.currentFont, this.currentFontSize, charToDelete);
            // Remove the last character from the canvas
            _DrawingContext.clearRect((this.currentXPosition - deleteWidth), (this.currentYPosition - this.currentFontSize), deleteWidth, (this.currentFontSize + 5));
            // Issue #8 Check to see if the cursor needs to be moved back to the previous line
            // The buffer needs to not be empty as well, don't want to backspace nothing to the previous line
            if ((this.buffer != "") && (this.currentXPosition <= deleteWidth)) {
                // Move the cursor up
                this.moveLineUp();
            }
            else {
                // Move the cursor back so next character printed in proper location
                this.currentXPosition -= deleteWidth;
            }
        };
        // Issue #5 Handles the up arrow for command recalling
        Console.prototype.handleUpArrow = function () {
            // Check if there is any previous commands to recall
            if (this.currentBufferIndex > 0) {
                // Save current command in the buffer history
                this.bufferHistory[this.currentBufferIndex] = this.buffer;
                // Get the length of the current buffer to delete it
                var deleteWidth = TSOS.CanvasTextFunctions.measure(this.currentFont, this.currentFontSize, this.buffer);
                // Erase the current listed command on the canvas
                _DrawingContext.clearRect((this.currentXPosition - deleteWidth), (this.currentYPosition - this.currentFontSize), deleteWidth, (this.currentFontSize + 5));
                // Decrement the currentBufferIndex, go back up in the history
                this.currentBufferIndex--;
                // Assign the previous command to the buffer
                this.buffer = this.bufferHistory[this.currentBufferIndex];
                // Move the x index back to 0
                this.currentXPosition = 0;
                // Display the prompt
                _OsShell.putPrompt();
                // Display the new current command on the canvas
                _StdOut.putText(this.buffer);
            }
        };
        // Issue #5 Handles the down arrow for command recalling
        Console.prototype.handleDownArrow = function () {
            // Check if there are any following commands in the buffer
            if (this.currentBufferIndex < (this.bufferHistory.length - 1)) {
                // Save the current command in the buffer history 
                this.bufferHistory[this.currentBufferIndex] = this.buffer;
                // Get the length of the current buffer to delete it
                var deleteWidth = TSOS.CanvasTextFunctions.measure(this.currentFont, this.currentFontSize, this.buffer);
                // Erase the current listed command on the canvas
                _DrawingContext.clearRect((this.currentXPosition - deleteWidth), (this.currentYPosition - this.currentFontSize), deleteWidth, (this.currentFontSize + 5));
                // Increment the currentBufferIndex, go down in the history
                this.currentBufferIndex++;
                // Assign the following command to the buffer
                this.buffer = this.bufferHistory[this.currentBufferIndex];
                // Move the x index back to 0
                this.currentXPosition = 0;
                // Display the prompt
                _OsShell.putPrompt();
                // Display the new current command on the canvas
                _StdOut.putText(this.buffer);
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
