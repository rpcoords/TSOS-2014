///<reference path="../globals.ts" />
/* ------------
Console.ts
Requires globals.ts
The OS Console - stdIn and stdOut by default.
Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize; }
            if (typeof buffer === "undefined") { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };

        Console.prototype.clearScreen = function () {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');

            _DrawingContext.fillStyle = "rgb(200,200,200)";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
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
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    // ... and reset our buffer.
                    _BuffStack.enqueue(this.buffer);
                    _ScrollQueue.enqueue(this.buffer);
                    _StringStack = new TSOS.Queue();
                    this.buffer = "";
                } else if (chr === String.fromCharCode(9)) {
                    for (var a = 1; a <= _OsShell.commandList.length; a++) {
                        if (_OsShell.commandList[a].contains(this.buffer)) {
                            // Clears line.
                            var x = this.currentXPosition;
                            _DrawingContext.fillRect(0, this.currentYPosition - 15, _Canvas.width, 100); // Clears line
                            this.currentXPosition = 0;
                            _OsShell.putPrompt();
                            this.currentXPosition = 12.48;

                            // Auto-completes command.
                            this.buffer = _OsShell.commandList[a];
                            this.putText(this.buffer);
                        }
                    }
                    var taLog = document.getElementById("taHostLog");
                    taLog.value = this.buffer;
                } else if (chr === String.fromCharCode(8)) {
                    var removed = _StringStack.pop();
                    this.buffer = _StringStack.pop();
                    _StringStack.enqueue(this.buffer);
                    var x = this.currentXPosition;
                    _DrawingContext.fillRect(0, this.currentYPosition - 15, _Canvas.width, 100); // Clears line
                    this.currentXPosition = 0;
                    _OsShell.putPrompt();
                    this.currentXPosition = 12.48;
                    this.putText(this.buffer);
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);

                    // ... and add it to our buffer.
                    this.buffer += chr;
                    _StringStack.enqueue(this.buffer);
                }
                // TODO: Write a case for Ctrl-C.
            }
        };

        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //this.putText(this.currentXPosition);
            if (text !== "") {
                for (var a = 0; a <= text.length - 1; a++) {
                    var letter = text.charAt(a);
                    while ((text.charAt(a + 1) !== " ") && (a !== text.length)) {
                        var letter = letter + text.charAt(a + 1);
                        a++;
                    }

                    // Move the current X position.
                    /*	var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, letter);
                    this.currentXPosition = this.currentXPosition + offset; */
                    if (this.currentXPosition >= 499) {
                        this.advanceLine();
                        this.currentXPosition = 0;
                    }

                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, letter);

                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, letter);
                    this.currentXPosition = this.currentXPosition + offset;
                }
                /*   // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, x, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = x + offset; */
            }
        };

        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;

            /*
            * Font size measures from the baseline to the highest point in the font.
            * Font descent measures from the baseline to the lowest point in the font.
            * Font height margin is extra spacing between the lines.
            */
            this.currentYPosition += _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;

            // TODO: Handle scrolling. (Project 1)
            if (this.currentYPosition > 497) {
                //var c = document.getElementById('display');
                // Copy text, clear screen, and paste text.
                var text = _DrawingContext.getImageData(0, 20.83, _Canvas.width, _Canvas.height - 20.83);
                this.clearScreen();
                _DrawingContext.putImageData(text, 0, 0);

                // Reset x and y positions.
                this.currentXPosition = 0;

                //this.currentYPosition = 479.17;
                this.currentYPosition = 480;
                //_OsShell.putPrompt();
                //c.translate(0,100);
                //c.save();
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
