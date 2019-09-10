/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
            public currentFontSize = _DefaultFontSize,
            public currentXPosition = 0,
            public currentYPosition = _DefaultFontSize,
            public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(9)) {
                    // Issue #5 tab command completion
                    this.handleTabAutoComplete(this.buffer);
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */

            // Moved this existing code into a variable so I could use it below for scrolling purposes.
            const lineIncrement = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;

            // This is the default code, just saved as a variable.
            this.currentYPosition += lineIncrement;

            // Check if the next line goes off the screen
            if (this.currentYPosition >= 500) {
                // Take a snapshot of the current canvas minus the top line, starting at postion (0, lineincrement)
                let snapshot = _DrawingContext.getImageData(0, lineIncrement, _Canvas.width, (_Canvas.height - lineIncrement));

                // Clear screen
                this.clearScreen();

                // Reprint canvas with adjusted canvas from the top.
                _DrawingContext.putImageData(snapshot, 0, 0);

                // Have to set current y positon to bottom of the screen
                // Setting the y position to be one line's increment away from the bottom
                // The plus 5 is to prevent commands from bunching up
                this.currentYPosition = (_Canvas.height - lineIncrement) + 10;
            }
        }

        // Issue #5 Handles the autocompletion of commands with the tab key
        // Doing it in this file rather than shell.js so I can edit the buffer
        public handleTabAutoComplete(buffer) {
            console.log("Flag 1: Tab pressed");
            console.log(buffer);

            // Get array of all potential commands

            // Create a list of matches to the buffer

            // Loop through all potenial commands and check for potential matches

            // If there is one match, autocomplete

            // If there are more than one match, display the matches

        } 
    }
}